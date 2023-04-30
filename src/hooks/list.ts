import type {
  CreateListingInstructionAccounts,
  CreateListingInstructionArgs,
  CloseListingInstructionAccounts,
  UpdateListingInstructionAccounts,
  UpdateListingInstructionArgs,
} from '@motleylabs/mtly-reward-center';
import {
  createCreateListingInstruction,
  createCloseListingInstruction,
  createUpdateListingInstruction,
} from '@motleylabs/mtly-reward-center';
import { AuctionHouseProgram } from '../utils/mtly-house';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import type { TransactionInstruction } from '@solana/web3.js';
import { PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { RewardCenterProgram } from '../modules/reward-center';
import { toLamports, toSol } from '../modules/sol';
import { useAuctionHouseContext } from '../providers/AuctionHouseProvider';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ErrorWithLogs, Nft, AuctionHouse, ActionInfo } from '../typings';
import { getMetadataAccount } from '../utils/metaplex';
import { reduceSettledPromise } from '../utils/promises';
import {
  buildTransaction,
  queueTransactionSign,
  queueVersionedTransactionSign,
} from '../utils/transactions';
import useLogin from './login';
import { useCachedBuddy } from './referrals';

export const TX_INTERVAL = 500; //milliseconds to wait between sending tx batches

interface ListNftForm {
  amount: string;
}

interface ListingDetailsForm extends ListNftForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
}
interface ListNftContext {
  listNft: boolean;
  listNftState: FormState<ListNftForm>;
  registerListNft: UseFormRegister<ListNftForm>;
  onListNftClick: () => void;
  onCancelListNftClick: () => void;
  handleSubmitListNft: UseFormHandleSubmit<ListNftForm>;
  onSubmitListNft: (form: ListingDetailsForm) => Promise<ActionInfo | null>;
}

export function useListNft(): ListNftContext {
  const { connected, publicKey, address, signTransaction, signAllTransactions } =
    useWalletContext();
  const login = useLogin();
  const { connection } = useConnection();

  const [listNft, setListNft] = useState(false);
  const {
    register: registerListNft,
    handleSubmit: handleSubmitListNft,
    reset,
    formState: listNftState,
  } = useForm<ListNftForm>();

  const { linkBuddy } = useCachedBuddy({
    wallet: address as string,
  });

  const onSubmitListNft = async ({
    amount,
    nft,
    auctionHouse,
  }: ListingDetailsForm): Promise<ActionInfo | null> => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !nft ||
      !nft.owner ||
      !auctionHouse.rewardCenter
    ) {
      return null;
    }

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);

    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);
    const token = auctionHouse.rewardCenter.tokenMint;
    const associatedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      new PublicKey(nft.owner)
    );

    const [sellerTradeState, tradeStateBump] =
      await RewardCenterProgram.findAuctioneerTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        1
      );

    const [programAsSigner, programAsSignerBump] =
      await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

    const [freeTradeState, freeTradeStateBump] = await AuctionHouseProgram.findTradeStateAddress(
      publicKey,
      auctionHouseAddress,
      associatedTokenAccount,
      treasuryMint,
      tokenMint,
      0,
      1
    );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [listingAddress] = await RewardCenterProgram.findListingAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CreateListingInstructionAccounts = {
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      listing: listingAddress,
      rewardCenter: rewardCenter,
      wallet: publicKey,
      tokenAccount: associatedTokenAccount,
      metadata: metadata,
      authority: authority,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: auctionHouseFeeAccount,
      sellerTradeState: sellerTradeState,
      freeSellerTradeState: freeTradeState,
      ahAuctioneerPda: auctioneer,
      programAsSigner: programAsSigner,
    };

    const args: CreateListingInstructionArgs = {
      createListingParams: {
        price: buyerPrice,
        tokenSize: 1,
        tradeStateBump,
        freeTradeStateBump,
        programAsSignerBump: programAsSignerBump,
      },
    };

    const instruction = createCreateListingInstruction(accounts, args);

    const sellerRewardTokenAccount = getAssociatedTokenAddressSync(token, publicKey);

    const sellerATAInstruction = createAssociatedTokenAccountInstruction(
      publicKey,
      sellerRewardTokenAccount,
      publicKey,
      token
    );

    const sellerATAInfo = await connection.getAccountInfo(sellerRewardTokenAccount);

    const arrayOfInstructions = new Array<TransactionInstruction>();

    if (!sellerATAInfo) {
      arrayOfInstructions.push(sellerATAInstruction);
    }

    arrayOfInstructions.push(instruction);

    const transactions: VersionedTransaction[] = [];
    let listingTxIndex = 0;
    try {
      const signedBuddyTx = await linkBuddy();
      if (signedBuddyTx) {
        transactions.push(signedBuddyTx);
        listingTxIndex = 1;
      }
    } catch (e) {}

    const { blockhash } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: arrayOfInstructions,
    }).compileToV0Message();
    const transactionV0 = new VersionedTransaction(messageV0);

    let newListing: ActionInfo | null = null;

    try {
      transactions.push(transactionV0);
      const pendingSigned = await queueVersionedTransactionSign({
        transactions,
        signAllTransactions,
        signTransaction,
        connection,
        txInterval: TX_INTERVAL,
      });

      const settledSignedTxs = reduceSettledPromise(pendingSigned);

      if (settledSignedTxs.rejected.length > 0) {
        throw settledSignedTxs.rejected[0];
      }

      if (settledSignedTxs.fulfilled.length > 0) {
        toast('Listing posted', { type: 'success' });

        if (listingTxIndex < settledSignedTxs.fulfilled.length) {
          const blockTimestamp = Math.floor(new Date().getTime() / 1000);

          newListing = {
            auctionHouseAddress: auctionHouseAddress.toBase58(),
            auctionHouseProgram: config.auctionHouseProgram ?? '',
            blockTimestamp,
            price: `${buyerPrice}`,
            signature: settledSignedTxs.fulfilled[listingTxIndex],
            userAddress: publicKey?.toBase58() ?? '',
          };
        }
      }
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Listing created',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });
      toast(error.message, { type: 'error' });
    } finally {
      setListNft(false);
      return newListing;
    }
  };

  const onListNftClick = useCallback(() => {
    if (connected) {
      return setListNft(true);
    }
    return login();
  }, [setListNft, connected, login]);

  const onCancelListNftClick = useCallback(() => {
    reset();
    setListNft(false);
  }, [setListNft, reset]);

  return {
    listNft,
    listNftState,
    registerListNft,
    onListNftClick,
    onCancelListNftClick,
    handleSubmitListNft,
    onSubmitListNft,
  };
}

export interface BulkListNftForm {
  globalBulkPrice: string;
  amounts: { [address: string]: string };
}

interface BulkListingForm extends BulkListNftForm {
  useGlobalPrice: boolean;
  nfts: Nft[];
}

interface BulkListPending {
  nft: Nft;
  instructionData: {
    listingAddress: PublicKey;
    sellerTradeState: PublicKey;
    tradeStateBump: number;
    buyerPrice: number;
    arrayPosition: number;
  };
}
interface BulkListContext {
  listingBulk: boolean;
  bulkListNftState: FormState<BulkListNftForm>;
  registerBulkListNft: UseFormRegister<BulkListNftForm>;
  onCancelBulkListNftClick: () => void;
  handleSubmitBulkListNft: UseFormHandleSubmit<BulkListNftForm>;
  onSubmitBulkListNft: (form: BulkListingForm) => Promise<{ fulfilled: Nft[] }>;
  globalBulkPrice: BulkListNftForm['globalBulkPrice'];
  amounts: BulkListNftForm['amounts'];
}

export function useBulkListing(): BulkListContext {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWalletContext();
  const login = useLogin();
  const { connection } = useConnection();
  const { auctionHouse } = useAuctionHouseContext();

  const [listingBulk, setListingBulk] = useState(false);
  const {
    register: registerBulkListNft,
    handleSubmit: handleSubmitBulkListNft,
    reset,
    formState: bulkListNftState,
    watch,
  } = useForm<BulkListNftForm>({
    defaultValues: { globalBulkPrice: '', amounts: {} },
  });

  const globalBulkPrice = watch('globalBulkPrice');
  const amounts = watch('amounts');

  const onSubmitBulkListNft = async ({
    amounts,
    globalBulkPrice,
    useGlobalPrice,
    nfts,
  }: BulkListingForm) => {
    if (!connected) {
      login();
      return { fulfilled: [] };
    }
    if (!publicKey || !signTransaction || !nfts || !auctionHouse || !auctionHouse.rewardCenter) {
      return { fulfilled: [] };
    }

    setListingBulk(true);

    const LISTINGS_PER_TX = 3; // >3 is too large

    const auctionHouseAddress = new PublicKey(config.auctionHouse);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);

    // create instruction list (and listed nfts with associated data for the cache)
    const pendingTxInstructions: TransactionInstruction[] = [];
    const updateListing: BulkListPending[] = [];
    let settledSignedTxs: {
      rejected: string[];
      fulfilled: { tx: string; id: number }[];
    } = {
      rejected: [],
      fulfilled: [],
    };
    let settledNftInstructions: {
      rejected: string[];
      fulfilled: BulkListPending[];
    } = { rejected: [], fulfilled: [] };
    try {
      const pendingNfts = await Promise.allSettled(
        nfts.map(async (nft): Promise<BulkListPending> => {
          if (!nft.owner) throw new Error(`${nft.mintAddress} has no owner data available`);
          if (!useGlobalPrice && !amounts[nft.mintAddress])
            throw new Error(`${nft.mintAddress} has no listing price`);
          if (useGlobalPrice && !globalBulkPrice) throw new Error('No Global price found');
          if (!auctionHouse || !auctionHouse.rewardCenter)
            throw new Error('Auction house information is invalid');

          const basePrice = useGlobalPrice ? globalBulkPrice : amounts[nft.mintAddress];
          const buyerPrice = toLamports(Number(basePrice));
          const tokenMint = new PublicKey(nft.mintAddress);
          const metadata = getMetadataAccount(tokenMint);
          const token = auctionHouse.rewardCenter.tokenMint;
          const associatedTokenAccount = getAssociatedTokenAddressSync(
            tokenMint,
            new PublicKey(nft.owner)
          );
          const [sellerTradeState, tradeStateBump] =
            await RewardCenterProgram.findAuctioneerTradeStateAddress(
              publicKey,
              auctionHouseAddress,
              associatedTokenAccount,
              treasuryMint,
              tokenMint,
              1
            );

          const [programAsSigner, programAsSignerBump] =
            await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

          const [freeTradeState, freeTradeStateBump] =
            await AuctionHouseProgram.findTradeStateAddress(
              publicKey,
              auctionHouseAddress,
              associatedTokenAccount,
              treasuryMint,
              tokenMint,
              0,
              1
            );

          const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(
            auctionHouseAddress
          );

          const [listingAddress] = await RewardCenterProgram.findListingAddress(
            publicKey,
            metadata,
            rewardCenter
          );

          const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
            auctionHouseAddress,
            rewardCenter
          );

          const accounts: CreateListingInstructionAccounts = {
            auctionHouseProgram: AuctionHouseProgram.PUBKEY,
            listing: listingAddress,
            rewardCenter: rewardCenter,
            wallet: publicKey,
            tokenAccount: associatedTokenAccount,
            metadata: metadata,
            authority: authority,
            auctionHouse: auctionHouseAddress,
            auctionHouseFeeAccount: auctionHouseFeeAccount,
            sellerTradeState: sellerTradeState,
            freeSellerTradeState: freeTradeState,
            ahAuctioneerPda: auctioneer,
            programAsSigner: programAsSigner,
          };

          const args: CreateListingInstructionArgs = {
            createListingParams: {
              price: buyerPrice,
              tokenSize: 1,
              tradeStateBump,
              freeTradeStateBump,
              programAsSignerBump: programAsSignerBump,
            },
          };

          const instruction = createCreateListingInstruction(accounts, args);

          const sellerRewardTokenAccount = getAssociatedTokenAddressSync(token, publicKey);

          const sellerATAInstruction = createAssociatedTokenAccountInstruction(
            publicKey,
            sellerRewardTokenAccount,
            publicKey,
            token
          );
          const sellerATAInfo = await connection.getAccountInfo(sellerRewardTokenAccount);

          if (!sellerATAInfo) {
            //We should probably only do this once? but not sure where else to put it since it requires individual token information
            pendingTxInstructions.push(sellerATAInstruction);
          }

          pendingTxInstructions.push(instruction);

          return {
            nft,
            instructionData: {
              listingAddress,
              sellerTradeState,
              tradeStateBump,
              buyerPrice,
              arrayPosition: pendingTxInstructions.length - 1,
            },
          };
        })
      );

      // nfts (+ data) with successfully made instructions go into .fulfilled, failed to .rejected;
      // "pendingTxInstructions" should only contain the successfully created instructions
      settledNftInstructions = reduceSettledPromise(pendingNfts);

      // Batch up the listing instructions into transactions
      const { blockhash } = await connection.getLatestBlockhash();

      const pendingTransactions = await buildTransaction({
        blockhash,
        instructions: pendingTxInstructions,
        instructionsPerTransactions: LISTINGS_PER_TX,
        payer: publicKey,
      });

      const pendingSigned = await queueTransactionSign({
        transactions: pendingTransactions,
        signTransaction,
        signAllTransactions,
        connection,
        txInterval: TX_INTERVAL,
      });

      //.fullfiled is tx Hashes / signatures -> use these if you want to confirm the txs before updating the cache
      settledSignedTxs = reduceSettledPromise(pendingSigned);

      for (const instruction of settledNftInstructions.fulfilled) {
        const transactionId = Math.floor(
          instruction.instructionData.arrayPosition / LISTINGS_PER_TX
        );

        if (settledSignedTxs.fulfilled.find((tx) => tx.id === transactionId)) {
          updateListing.push(instruction);
        }
      }

      updateListing.map(({ instructionData }) => {
        const { listingAddress, sellerTradeState, tradeStateBump, buyerPrice } = instructionData;

        // eslint-disable-next-line no-console
        console.log(listingAddress, sellerTradeState, tradeStateBump, buyerPrice);
      });
    } catch (e) {
      throw e;
    } finally {
      setListingBulk(false);
    }

    if (settledSignedTxs.fulfilled.length > 0) {
      const fulfilledNfts = updateListing.map(({ nft }) => nft);
      toast(`Listings posted: ${fulfilledNfts.map((nft) => nft.name).join(', ')}`, {
        type: 'success',
      });
      return { fulfilled: fulfilledNfts };
    }

    toast('No Items were listed', { type: 'error' });
    return { fulfilled: [] };
  };

  const onCancelBulkListNftClick = useCallback(() => {
    reset();
    setListingBulk(false);
  }, [setListingBulk, reset]);

  return {
    listingBulk,
    bulkListNftState,
    handleSubmitBulkListNft,
    registerBulkListNft,
    onSubmitBulkListNft,
    onCancelBulkListNftClick,
    globalBulkPrice,
    amounts,
  };
}

interface UpdateListingArgs {
  listing: ActionInfo | null;
}

interface UpdateListingForm {
  amount: string;
}

interface UpdateListingDetailsForm extends UpdateListingForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
  setNft: Dispatch<SetStateAction<Nft>>;
}

interface UpdateListingContext {
  updateListing: boolean;
  updateListingState: FormState<UpdateListingForm>;
  registerUpdateListing: UseFormRegister<UpdateListingForm>;
  onUpdateListing: () => void;
  onCancelUpdateListing: () => void;
  handleSubmitUpdateListing: UseFormHandleSubmit<UpdateListingForm>;
  onSubmitUpdateListing: (form: UpdateListingDetailsForm) => Promise<ActionInfo | null>;
}

export function useUpdateListing({ listing }: UpdateListingArgs): UpdateListingContext {
  const { connected, publicKey, signTransaction } = useWalletContext();
  const login = useLogin();
  const { connection } = useConnection();
  const [updateListing, setUpdateListing] = useState(false);

  const {
    register: registerUpdateListing,
    handleSubmit: handleSubmitUpdateListing,
    reset,
    formState: updateListingState,
  } = useForm<UpdateListingForm>();

  useEffect(() => {
    if (!!listing) {
      reset({
        amount: `${toSol(Number(listing.price), 9)}`,
      });
    }
  }, [listing, listing?.price, reset]);

  const onSubmitUpdateListing = async ({
    amount,
    nft,
    auctionHouse,
  }: ListingDetailsForm): Promise<ActionInfo | null> => {
    if (!connected || !publicKey || !signTransaction || !nft || !nft.owner) {
      return null;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);

    const associatedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      new PublicKey(nft.owner)
    );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [listingAddress] = await RewardCenterProgram.findListingAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const accounts: UpdateListingInstructionAccounts = {
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      listing: listingAddress,
      rewardCenter: rewardCenter,
      wallet: publicKey,
      tokenAccount: associatedTokenAccount,
      metadata: metadata,
      auctionHouse: auctionHouseAddress,
    };

    const args: UpdateListingInstructionArgs = {
      updateListingParams: {
        newPrice: buyerPrice,
      },
    };

    const instruction = createUpdateListingInstruction(accounts, args);

    const tx = new Transaction();
    tx.add(instruction);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;

    let newListing: ActionInfo | null = null;

    try {
      const signedTx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      if (!signature) {
        return null;
      }
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        'confirmed'
      );

      toast('Listing price updated', { type: 'success' });

      const blockTimestamp = Math.floor(new Date().getTime() / 1000);
      newListing = {
        auctionHouseAddress: auctionHouseAddress.toBase58(),
        auctionHouseProgram: config.auctionHouseProgram ?? '',
        blockTimestamp,
        price: `${buyerPrice}`,
        signature,
        userAddress: publicKey?.toBase58() ?? '',
      };
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Listing updated',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });
      toast(error.message, { type: 'error' });
    } finally {
      setUpdateListing(false);
      return newListing;
    }
  };

  const onUpdateListing = useCallback(() => {
    if (connected) {
      return setUpdateListing(true);
    }

    return login();
  }, [setUpdateListing, connected, login]);

  const onCancelUpdateListing = useCallback(() => {
    reset();
    setUpdateListing(false);
  }, [setUpdateListing, reset]);

  return {
    updateListing,
    updateListingState,
    registerUpdateListing,
    onUpdateListing,
    onCancelUpdateListing,
    handleSubmitUpdateListing,
    onSubmitUpdateListing,
  };
}

interface CloseListingArgs {
  nft: Nft;
  listing: ActionInfo | null;
  auctionHouse?: AuctionHouse | null;
  setNft: Dispatch<SetStateAction<Nft>>;
}

interface CancelListingContext {
  onCloseListing: () => Promise<string | null>;
  closingListing: boolean;
}

export function useCloseListing({
  listing,
  nft,
  auctionHouse,
}: CloseListingArgs): CancelListingContext {
  const { publicKey, signTransaction } = useWalletContext();
  const { connection } = useConnection();
  const [closingListing, setClosing] = useState(false);

  const onCloseListing = async (): Promise<string | null> => {
    if (!publicKey || !signTransaction || !listing || !nft || !nft.owner || !auctionHouse) {
      return null;
    }
    setClosing(true);

    const auctionHouseAddress = new PublicKey(config.auctionHouse);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);
    const associatedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      new PublicKey(nft.owner)
    );

    const [sellerTradeState] = await RewardCenterProgram.findAuctioneerTradeStateAddress(
      publicKey,
      auctionHouseAddress,
      associatedTokenAccount,
      treasuryMint,
      tokenMint,
      1
    );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [listingAddress] = await RewardCenterProgram.findListingAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CloseListingInstructionAccounts = {
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      listing: listingAddress,
      rewardCenter: rewardCenter,
      wallet: publicKey,
      tokenAccount: associatedTokenAccount,
      metadata: metadata,
      authority: authority,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: auctionHouseFeeAccount,
      tokenMint,
      tradeState: sellerTradeState,
      ahAuctioneerPda: auctioneer,
    };

    const instruction = createCloseListingInstruction(accounts);

    const tx = new Transaction();
    tx.add(instruction);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;
    let signature: string | null = null;

    try {
      const signedTx = await signTransaction(tx);
      signature = await connection.sendRawTransaction(signedTx.serialize());
      if (!signature) {
        return null;
      }
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        'confirmed'
      );

      toast('Listing canceled', { type: 'success' });
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Listing cancelled',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });
      toast(error.message, { type: 'error' });
    } finally {
      setClosing(false);
      return signature;
    }
  };

  return {
    onCloseListing,
    closingListing,
  };
}
