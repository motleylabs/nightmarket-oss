import { zodResolver } from '@hookform/resolvers/zod';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import type {
  CreateOfferInstructionAccounts,
  CreateOfferInstructionArgs,
  CloseOfferInstructionAccounts,
  CloseOfferInstructionArgs,
  AcceptOfferInstructionAccounts,
  AcceptOfferInstructionArgs,
  CloseListingInstructionAccounts,
} from '@motleylabs/mtly-reward-center';
import {
  createCreateOfferInstruction,
  createCloseOfferInstruction,
  createAcceptOfferInstruction,
  createCloseListingInstruction,
} from '@motleylabs/mtly-reward-center';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { AccountMeta, AddressLookupTableAccount } from '@solana/web3.js';
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { useCallback, useMemo, useState } from 'react';
import type { UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import zod from 'zod';

import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { RewardCenterProgram } from '../modules/reward-center';
import { toLamports, toSol } from '../modules/sol';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, ErrorWithLogs, Nft, Offer, Collection, AuctionHouse } from '../typings';
import { getPNFTAccounts, getMetadataAccount } from '../utils/metaplex';
import { AuctionHouseProgram } from '../utils/mtly-house';
import { reduceSettledPromise } from '../utils/promises';
import { queueVersionedTransactionSign } from '../utils/transactions';
import { TX_INTERVAL } from './list';
import useLogin from './login';
import { useCachedBuddy } from './referrals';

export interface OfferForm {
  amount: number;
}

interface MakeOfferForm extends OfferForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface MakeOfferResponse {
  buyerTradeState: PublicKey;
  metadata: PublicKey;
  buyerTradeStateBump: number;
  associatedTokenAccount: PublicKey;
  buyerPrice: number;
  signature: string;
}

interface MakeOfferContext {
  makeOffer: boolean;
  registerOffer: UseFormRegister<OfferForm>;
  handleSubmitOffer: UseFormHandleSubmit<OfferForm>;
  onMakeOffer: ({
    amount,
    nft,
    auctionHouse,
  }: MakeOfferForm) => Promise<MakeOfferResponse | undefined>;
  onOpenOffer: () => void;
  onCancelMakeOffer: () => void;
  offerFormState: FormState<OfferForm>;
}

export function useMakeOffer(listing: ActionInfo | null, floorPrice?: string): MakeOfferContext {
  const { connected, publicKey, address, signTransaction, signAllTransactions } =
    useWalletContext();

  const { connection } = useConnection();
  const login = useLogin();
  const [makeOffer, setMakeOffer] = useState(false);

  const { linkBuddy } = useCachedBuddy({
    wallet: address as string,
  });

  const offerSchema = useMemo(() => {
    let validation: zod.ZodNumber = zod.number();

    if (listing?.price) {
      const minOfferLamports = Number(listing?.price) * config.offerMinimums.percentageListing;

      validation = validation.min(
        minOfferLamports,
        `Your offer must be at least ${toSol(minOfferLamports)} which is ${
          config.offerMinimums.percentageListing * 100
        }% of the listing price`
      );
    } else if (floorPrice) {
      const minOfferLamports = Number(floorPrice) * config.offerMinimums.percentageFloor;

      validation = validation.min(
        minOfferLamports,
        `Your offer must be at least ${toSol(minOfferLamports)} which is ${
          config.offerMinimums.percentageFloor * 100
        }% of the floor price`
      );
    }

    return zod.object({
      amount: zod.preprocess((input) => {
        const processed = zod
          .string()
          .min(1, `Must enter an amount`)
          .regex(/^[0-9.]*$/, { message: `Must be a number` })
          .transform(Number)
          .transform(toLamports)
          .safeParse(input);
        return processed.success ? processed.data : input;
      }, validation),
    });
  }, [floorPrice, listing?.price]);

  const {
    register: registerOffer,
    handleSubmit: handleSubmitOffer,
    formState: offerFormState,
  } = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
  });

  const onMakeOffer = async ({ amount, nft, auctionHouse }: MakeOfferForm) => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !nft ||
      !nft.owner ||
      !auctionHouse.rewardCenter
    ) {
      throw Error('not all params provided');
    }

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = amount; // already preprocessed as lamports by zod
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);
    const associatedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      new PublicKey(nft.owner)
    );
    const token = auctionHouse.rewardCenter.tokenMint;

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        buyerPrice,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);
    const [offer] = await RewardCenterProgram.findOfferAddress(publicKey, metadata, rewardCenter);
    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CreateOfferInstructionAccounts = {
      wallet: publicKey,
      offer,
      paymentAccount: publicKey,
      transferAuthority: publicKey,
      treasuryMint,
      tokenAccount: associatedTokenAccount,
      metadata,
      escrowPaymentAccount: escrowPaymentAcc,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      buyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const args: CreateOfferInstructionArgs = {
      createOfferParams: {
        tradeStateBump: buyerTradeStateBump,
        escrowPaymentBump,
        buyerPrice,
        tokenSize: 1,
      },
    };

    const instruction = createCreateOfferInstruction(accounts, args);
    const arrayOfInstructions = new Array<TransactionInstruction>();

    const ix = ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 });
    arrayOfInstructions.push(ix);

    const buyerRewardTokenAccount = getAssociatedTokenAddressSync(token, publicKey);

    const buyerATAInstruction = createAssociatedTokenAccountInstruction(
      publicKey,
      buyerRewardTokenAccount,
      publicKey,
      token
    );

    const buyerAtAInfo = await connection.getAccountInfo(buyerRewardTokenAccount);

    if (!buyerAtAInfo) {
      arrayOfInstructions.push(buyerATAInstruction);
    }

    arrayOfInstructions.push(instruction);

    const transactions: VersionedTransaction[] = [];
    let offerIndex = 0;
    try {
      const signedBuddyTx = await linkBuddy();
      if (signedBuddyTx) {
        transactions.push(signedBuddyTx);
        offerIndex = 1;
      }
    } catch (e) {}

    const { blockhash } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: arrayOfInstructions,
    }).compileToV0Message();
    const tx = new VersionedTransaction(messageV0);

    try {
      transactions.push(tx);
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

      let signature = '';
      if (settledSignedTxs.fulfilled.length > 0) {
        toast('Your offer is in', { type: 'success' });

        if (offerIndex < settledSignedTxs.fulfilled.length) {
          signature = settledSignedTxs.fulfilled[offerIndex];
        }
      }

      return {
        buyerTradeState,
        metadata,
        buyerTradeStateBump,
        associatedTokenAccount,
        buyerPrice,
        signature,
      };
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Offer created',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });
      toast(error.message, { type: 'error' });

      throw err;
    } finally {
      setMakeOffer(false);
    }
  };

  const onOpenOffer = useCallback(() => {
    if (connected) {
      setMakeOffer(true);
      return;
    }
    login();
  }, [setMakeOffer, login, connected]);

  const onCancelMakeOffer = useCallback(() => {
    setMakeOffer(false);
  }, [setMakeOffer]);

  return {
    registerOffer,
    offerFormState,
    makeOffer,
    onOpenOffer,
    onMakeOffer,
    handleSubmitOffer,
    onCancelMakeOffer,
  };
}

interface UpdateOfferContext {
  updateOffer: boolean;
  registerUpdateOffer: UseFormRegister<OfferForm>;
  handleSubmitUpdateOffer: UseFormHandleSubmit<OfferForm>;
  onUpdateOffer: ({ amount, nft, auctionHouse }: MakeOfferForm) => Promise<string | null>;
  onOpenUpdateOffer: () => void;
  onCancelUpdateOffer: () => void;
  updateOfferFormState: FormState<OfferForm>;
}

export function useUpdateOffer(
  offer: Offer | null,
  listing: ActionInfo | null,
  nft?: Nft,
  collection?: Collection
): UpdateOfferContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const login = useLogin();
  const [updateOffer, setUpdateOffer] = useState(false);

  const offerSchema = useMemo(() => {
    let validation: zod.ZodNumber = zod.number();

    if (listing?.price) {
      const minOfferLamports = Number(listing.price) * config.offerMinimums.percentageListing;

      validation = validation.min(
        minOfferLamports,
        `Your offer must be at least ${toSol(minOfferLamports)} which is ${
          config.offerMinimums.percentageListing * 100
        }% of the listing price`
      );
    } else if (!!collection) {
      const minOfferLamports =
        Number(collection.statistics.floor1d) * config.offerMinimums.percentageFloor;

      validation = validation.min(
        minOfferLamports,
        `Your offer must be at least ${toSol(minOfferLamports)} which is ${Math.round(
          config.offerMinimums.percentageFloor * 100
        )}% of the floor price`
      );
    }

    return zod.object({
      amount: zod.preprocess((input) => {
        const processed = zod
          .string()
          .min(1, `Must enter an amount`)
          .regex(/^[0-9.]*$/, { message: `Must be a number` })
          .transform(Number)
          .transform(toLamports)
          .safeParse(input);
        return processed.success ? processed.data : input;
      }, validation),
    });
  }, [collection, listing?.price]);

  const {
    register: registerUpdateOffer,
    handleSubmit: handleSubmitUpdateOffer,
    formState: updateOfferFormState,
  } = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
  });

  const onUpdateOffer = async ({
    amount,
    nft,
    auctionHouse,
  }: MakeOfferForm): Promise<string | null> => {
    if (!connected || !publicKey || !signTransaction || !offer || !nft || !nft.owner) {
      return null;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const newOfferPrice = amount; // already preprocessed as lamports by zod to lamports by zod
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);
    const associatedTokenAcc = getAssociatedTokenAddressSync(tokenMint, new PublicKey(nft.owner));

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerTradeState] = await AuctionHouseProgram.findPublicBidTradeStateAddress(
      publicKey,
      auctionHouseAddress,
      treasuryMint,
      tokenMint,
      Number(offer.price),
      1
    );

    const [updatedBuyerTradeState, updatedTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        newOfferPrice,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [rewardsOffer] = await RewardCenterProgram.findOfferAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const closeOfferAccounts: CloseOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      receiptAccount: publicKey,
      escrowPaymentAccount: escrowPaymentAcc,
      metadata,
      tokenMint,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      tradeState: buyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const closeOfferArgs: CloseOfferInstructionArgs = {
      closeOfferParams: {
        escrowPaymentBump,
      },
    };

    const closeOfferIx = createCloseOfferInstruction(closeOfferAccounts, closeOfferArgs);

    const createofferAccounts: CreateOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      paymentAccount: publicKey,
      transferAuthority: publicKey,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      metadata,
      escrowPaymentAccount: escrowPaymentAcc,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      buyerTradeState: updatedBuyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const createOfferArgs: CreateOfferInstructionArgs = {
      createOfferParams: {
        tradeStateBump: updatedTradeStateBump,
        escrowPaymentBump,
        buyerPrice: newOfferPrice,
        tokenSize: 1,
      },
    };

    const createOfferIx = createCreateOfferInstruction(createofferAccounts, createOfferArgs);

    const tx = new Transaction();
    const ix = ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 });
    tx.add(ix);
    tx.add(closeOfferIx);
    tx.add(createOfferIx);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;
    let signature: string | null = null;

    try {
      const signedTx = await signTransaction(tx);
      signature = await connection.sendRawTransaction(signedTx.serialize());
      if (signature) {
        await connection.confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature,
          },
          'confirmed'
        );
        toast('Offer updated', { type: 'success' });
      }
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Offer updated',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });

      toast(error.message, { type: 'error' });
    } finally {
      setUpdateOffer(false);
      return signature;
    }
  };

  const onOpenUpdateOffer = useCallback(() => {
    if (connected) {
      setUpdateOffer(true);
      return;
    }
    login();
  }, [setUpdateOffer, login, connected]);

  const onCancelUpdateOffer = useCallback(() => {
    setUpdateOffer(false);
  }, [setUpdateOffer]);

  return {
    updateOffer,
    registerUpdateOffer,
    updateOfferFormState,
    onUpdateOffer,
    handleSubmitUpdateOffer,
    onOpenUpdateOffer,
    onCancelUpdateOffer,
  };
}

interface CancelOfferContext {
  closingOffer: boolean;
  onCloseOffer: (payload: {
    nft: Nft | null;
    auctionHouse?: AuctionHouse | null;
  }) => Promise<string | null>;
}

export function useCloseOffer(offer: Offer | null): CancelOfferContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const login = useLogin();
  const [closingOffer, setClosingOffer] = useState(false);

  const onCloseOffer = async ({
    nft,
    auctionHouse,
  }: {
    nft: Nft | null;
    auctionHouse?: AuctionHouse | null;
  }): Promise<string | null> => {
    if (!connected || !publicKey || !signTransaction) {
      login();
      return null;
    }

    if (!auctionHouse || !offer || !nft || !nft.owner) {
      return null;
    }
    setClosingOffer(true);
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);
    const associatedTokenAcc = getAssociatedTokenAddressSync(tokenMint, new PublicKey(nft.owner));

    const [buyerTradeState] = await AuctionHouseProgram.findPublicBidTradeStateAddress(
      publicKey,
      auctionHouseAddress,
      treasuryMint,
      tokenMint,
      Number(offer.price),
      1
    );

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [rewardsOffer] = await RewardCenterProgram.findOfferAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CloseOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      receiptAccount: publicKey,
      escrowPaymentAccount: escrowPaymentAcc,
      metadata,
      tokenMint,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      tradeState: buyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const args: CloseOfferInstructionArgs = {
      closeOfferParams: {
        escrowPaymentBump,
      },
    };

    const instruction = createCloseOfferInstruction(accounts, args);
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

      toast('Offer canceled', { type: 'success' });
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Offer cancelled',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });

      toast(error.message, { type: 'error' });

      throw error;
    } finally {
      setClosingOffer(false);
      return signature;
    }
  };

  return {
    closingOffer,
    onCloseOffer,
  };
}

interface AcceptOfferParams {
  nft: Nft;
  listing: ActionInfo | null;
  auctionHouse?: AuctionHouse | null;
}

export interface AcceptOfferResponse {
  buyerTradeState: PublicKey;
  metadata: PublicKey;
  buyerReceiptTokenAccount: PublicKey;
  acceptAction: ActionInfo | null;
}

interface AcceptOfferContext {
  acceptingOffer: boolean;
  onAcceptOffer: (args: AcceptOfferParams) => Promise<AcceptOfferResponse | undefined>;
}

export function useAcceptOffer(offer: Offer | null): AcceptOfferContext {
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const { connected, publicKey, address, signTransaction, signAllTransactions } =
    useWalletContext();
  const { connection } = useConnection();
  const { linkBuddy } = useCachedBuddy({
    wallet: address as string,
  });

  const onAcceptOffer = async ({ auctionHouse, nft, listing }: AcceptOfferParams) => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !offer ||
      !nft ||
      !nft.owner ||
      !auctionHouse ||
      !auctionHouse.rewardCenter
    ) {
      throw Error('not all params provided');
    }

    setAcceptingOffer(true);

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = Number(offer.price);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const auctionHouseTreasury = new PublicKey(auctionHouse.auctionHouseTreasury);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = getMetadataAccount(tokenMint);
    const buyerAddress = new PublicKey(offer.buyer);
    const token = auctionHouse.rewardCenter.tokenMint;
    const associatedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      new PublicKey(nft.owner)
    );

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        buyerAddress,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        buyerPrice,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [escrowPaymentAccount, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, buyerAddress);

    const rewardCenterRewardTokenAccount = getAssociatedTokenAddressSync(token, rewardCenter, true);

    const buyerReceiptTokenAccount = getAssociatedTokenAddressSync(tokenMint, buyerAddress);

    const [sellerTradeState, sellerTradeStateBump] =
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

    const [freeSellerTradeState, freeTradeStateBump] =
      await AuctionHouseProgram.findTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        0,
        1
      );

    const [rewardsOffer] = await RewardCenterProgram.findOfferAddress(
      buyerAddress,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const buyerRewardTokenAccount = getAssociatedTokenAddressSync(token, buyerAddress);

    const sellerRewardTokenAccount = getAssociatedTokenAddressSync(token, publicKey);

    const sellerATAInstruction = createAssociatedTokenAccountInstruction(
      publicKey,
      sellerRewardTokenAccount,
      publicKey,
      token
    );

    const sellerAtAInfo = await connection.getAccountInfo(sellerRewardTokenAccount);

    const acceptOfferAccounts: AcceptOfferInstructionAccounts = {
      buyer: buyerAddress,
      buyerRewardTokenAccount,
      seller: publicKey,
      sellerRewardTokenAccount,
      offer: rewardsOffer,
      tokenAccount: associatedTokenAccount,
      tokenMint,
      metadata,
      treasuryMint,
      sellerPaymentReceiptAccount: publicKey,
      buyerReceiptTokenAccount,
      authority,
      escrowPaymentAccount,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount,
      auctionHouseTreasury,
      sellerTradeState,
      buyerTradeState,
      freeSellerTradeState,
      rewardCenter,
      rewardCenterRewardTokenAccount,
      ahAuctioneerPda: auctioneer,
      programAsSigner,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const acceptOfferArgs: AcceptOfferInstructionArgs = {
      acceptOfferParams: {
        escrowPaymentBump,
        freeTradeStateBump,
        sellerTradeStateBump,
        programAsSignerBump,
        buyerTradeStateBump,
      },
    };

    const acceptOfferIx = createAcceptOfferInstruction(acceptOfferAccounts, acceptOfferArgs);

    let remainingAccounts: AccountMeta[] = [];

    // find NFT creators
    const metadataAccountInfo = await connection.getAccountInfo(metadata);
    if (!!metadataAccountInfo) {
      const metadataInfo = Metadata.deserialize(metadataAccountInfo.data as Buffer, 0)[0];
      if (!!metadataInfo.data.creators) {
        for (const creator of metadataInfo.data.creators) {
          const creatorAccount = {
            pubkey: new PublicKey(creator.address),
            isSigner: false,
            isWritable: true,
          };
          remainingAccounts = [...remainingAccounts, creatorAccount];
        }
      }
    }

    if (nft.tokenStandard === 'ProgrammableNonFungible') {
      const pnftAccounts = await getPNFTAccounts(
        connection,
        buyerAddress,
        programAsSigner,
        tokenMint,
        publicKey
      );
      remainingAccounts.push(pnftAccounts.metadataProgram);
      remainingAccounts.push(pnftAccounts.edition);
      remainingAccounts.push(pnftAccounts.sellerTokenRecord);
      remainingAccounts.push(pnftAccounts.tokenRecord);
      remainingAccounts.push(pnftAccounts.authRulesProgram);
      remainingAccounts.push(pnftAccounts.authRules);
      remainingAccounts.push(pnftAccounts.sysvarInstructions);
    }

    // patch metadata account to writable for AH / RWD
    for (let i = 0; i < acceptOfferIx.keys.length; i++) {
      if (acceptOfferIx.keys[i].pubkey.equals(metadata)) {
        acceptOfferIx.keys[i].isWritable = true;
      }
    }

    const keys = acceptOfferIx.keys.concat(remainingAccounts);

    const ix = ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 });

    const arrayOfInstructions = new Array<TransactionInstruction>();

    const lookupTableAccount = await connection
      .getAddressLookupTable(new PublicKey(config.addressLookupTable))
      .then((res) => res.value);

    arrayOfInstructions.push(ix);

    if (listing) {
      const [listingAddress] = await RewardCenterProgram.findListingAddress(
        publicKey,
        metadata,
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

      if (nft.tokenStandard === 'ProgrammableNonFungible') {
        const pnftAccounts = await getPNFTAccounts(
          connection,
          publicKey,
          programAsSigner,
          tokenMint
        );
        const remainingAccounts: AccountMeta[] = [];
        remainingAccounts.push(pnftAccounts.metadataProgram);
        remainingAccounts.push(pnftAccounts.delegateRecord);
        remainingAccounts.push(pnftAccounts.programAsSigner);
        remainingAccounts.push({ isSigner: false, isWritable: true, pubkey: metadata });
        remainingAccounts.push(pnftAccounts.edition);
        remainingAccounts.push(pnftAccounts.tokenRecord);
        remainingAccounts.push(pnftAccounts.tokenMint);
        remainingAccounts.push(pnftAccounts.authRulesProgram);
        remainingAccounts.push(pnftAccounts.authRules);
        remainingAccounts.push(pnftAccounts.sysvarInstructions);
        remainingAccounts.push(pnftAccounts.systemProgram);
        accounts.anchorRemainingAccounts = remainingAccounts;
      }

      const closeListingIx = createCloseListingInstruction(accounts);

      arrayOfInstructions.push(closeListingIx);
    }

    if (!sellerAtAInfo) {
      arrayOfInstructions.push(sellerATAInstruction);
    }

    arrayOfInstructions.push(
      new TransactionInstruction({
        programId: RewardCenterProgram.PUBKEY,
        data: acceptOfferIx.data,
        keys,
      })
    );

    const transactions: VersionedTransaction[] = [];
    let acceptOfferIndex = 0;
    try {
      const signedBuddyTx = await linkBuddy();
      if (signedBuddyTx) {
        transactions.push(signedBuddyTx);
        acceptOfferIndex = 1;
      }
    } catch (e) {}

    let acceptAction: ActionInfo | null = null;
    const { blockhash } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: arrayOfInstructions,
    }).compileToV0Message([lookupTableAccount as AddressLookupTableAccount]);

    const transactionV0 = new VersionedTransaction(messageV0);

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
        toast('Offer accepted', { type: 'success' });

        if (acceptOfferIndex < settledSignedTxs.fulfilled.length) {
          const blockTimestamp = Math.floor(new Date().getTime() / 1000);

          acceptAction = {
            auctionHouseAddress: auctionHouseAddress.toBase58(),
            auctionHouseProgram: config.auctionHouseProgram ?? '',
            blockTimestamp,
            price: offer.price,
            signature: settledSignedTxs.fulfilled[acceptOfferIndex],
            userAddress: offer.buyer,
          };
        }
      }
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'Offer accepted',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });

      toast(error.message, { type: 'error' });

      throw error;
    } finally {
      setAcceptingOffer(false);
      return { buyerTradeState, metadata, buyerReceiptTokenAccount, acceptAction };
    }
  };

  return {
    acceptingOffer,
    onAcceptOffer,
  };
}
