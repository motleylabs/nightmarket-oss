import { NightmarketClient, TxRes } from '@motleylabs/mtly-nightmarket';
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
import { toLamports, toSol } from '../modules/sol';
import { useAuctionHouseContext } from '../providers/AuctionHouseProvider';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ErrorWithLogs, Nft, AuctionHouse, ActionInfo } from '../typings';
import { reduceSettledPromise } from '../utils/promises';
import { buildVersionedTransaction, queueVersionedTransactionSign } from '../utils/transactions';
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
    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const txRes: TxRes = await nightmarketClient.CreateListing(
      new PublicKey(nft.mintAddress),
      Number(amount),
      publicKey
    );

    if (!!txRes.err) {
      toast(txRes.err, { type: 'error' });
      return null;
    }

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
      instructions: txRes.instructions,
    }).compileToV0Message(txRes.ltAccounts);
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
            signature: settledSignedTxs.fulfilled[listingTxIndex].tx,
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

    const LISTINGS_PER_TX = 2;

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
          const nightmarketClient = new NightmarketClient(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? ''
          );
          const txRes: TxRes = await nightmarketClient.CreateListing(
            new PublicKey(nft.mintAddress),
            Number(basePrice),
            publicKey,
            false
          );

          if (!!txRes.err) {
            throw txRes.err;
          }

          pendingTxInstructions.push(...txRes.instructions);

          return {
            nft,
            instructionData: {
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
      const lookupTableAccount = await connection
        .getAddressLookupTable(new PublicKey(config.addressLookupTable))
        .then((res) => res.value);

      const versionedTxs = await buildVersionedTransaction({
        blockhash,
        instructions: pendingTxInstructions,
        instructionsPerTransactions: LISTINGS_PER_TX,
        payer: publicKey,
        alts: !!lookupTableAccount ? [lookupTableAccount] : [],
      });

      const pendingSigned = await queueVersionedTransactionSign({
        transactions: versionedTxs,
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
    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const txRes: TxRes = await nightmarketClient.UpdateListing(
      new PublicKey(nft.mintAddress),
      Number(amount),
      publicKey
    );

    if (!!txRes.err) {
      toast(txRes.err, { type: 'error' });
      return null;
    }

    const tx = new Transaction();
    tx.add(...txRes.instructions);

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

    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const txRes: TxRes = await nightmarketClient.CloseListing(
      new PublicKey(nft.mintAddress),
      publicKey
    );

    if (!!txRes.err) {
      toast(txRes.err, { type: 'error' });
      return null;
    }

    const tx = new Transaction();
    tx.add(...txRes.instructions);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;
    let signature: string | null = null;

    try {
      const signedTx = await signTransaction(tx);
      signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
      });
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
