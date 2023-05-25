import { zodResolver } from '@hookform/resolvers/zod';
import { NightmarketClient, TxRes } from '@motleylabs/mtly-nightmarket';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { useCallback, useMemo, useState } from 'react';
import type { UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import zod from 'zod';

import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { toLamports, toSol } from '../modules/sol';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, ErrorWithLogs, Nft, Offer, Collection, AuctionHouse } from '../typings';
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
}

interface MakeOfferResponse {
  buyerPrice: number;
  signature: string;
}

interface MakeOfferContext {
  makeOffer: boolean;
  registerOffer: UseFormRegister<OfferForm>;
  handleSubmitOffer: UseFormHandleSubmit<OfferForm>;
  onMakeOffer: ({ amount, nft }: MakeOfferForm) => Promise<MakeOfferResponse | undefined>;
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

  const onMakeOffer = async ({ amount, nft }: MakeOfferForm) => {
    if (!connected || !publicKey || !signTransaction || !nft || !nft.owner) {
      throw Error('not all params provided');
    }

    const buyerPrice = amount; // already preprocessed as lamports by zod
    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const txRes: TxRes = await nightmarketClient.CreateOffer(
      new PublicKey(nft.mintAddress),
      toSol(amount, 9),
      new PublicKey(nft.owner),
      publicKey
    );

    if (!!txRes.err) {
      toast(txRes.err, { type: 'error' });
      return;
    }

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
      instructions: txRes.instructions,
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
          signature = settledSignedTxs.fulfilled[offerIndex].tx;
        }
      }

      return {
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
  onUpdateOffer: ({ amount, nft }: MakeOfferForm) => Promise<string | null>;
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

  const onUpdateOffer = async ({ amount, nft }: MakeOfferForm): Promise<string | null> => {
    if (!connected || !publicKey || !signTransaction || !nft || !offer || !nft.owner) {
      return null;
    }

    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const tx = new Transaction();

    const closeOfferRes: TxRes = await nightmarketClient.CloseOffer(
      new PublicKey(nft.mintAddress),
      toSol(Number(offer.price), 9),
      new PublicKey(nft.owner),
      publicKey
    );

    if (!!closeOfferRes.err) {
      toast(closeOfferRes.err, { type: 'error' });
      return null;
    }
    tx.add(...closeOfferRes.instructions);

    const createOfferRes: TxRes = await nightmarketClient.CreateOffer(
      new PublicKey(nft.mintAddress),
      toSol(amount, 9),
      new PublicKey(nft.owner),
      publicKey
    );

    if (!!createOfferRes.err) {
      toast(createOfferRes.err, { type: 'error' });
      return null;
    }
    tx.add(...createOfferRes.instructions);

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
    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const tx = new Transaction();

    const closeOfferRes: TxRes = await nightmarketClient.CloseOffer(
      new PublicKey(nft.mintAddress),
      toSol(Number(offer.price), 9),
      new PublicKey(nft.owner),
      publicKey
    );

    if (!!closeOfferRes.err) {
      toast(closeOfferRes.err, { type: 'error' });
      return null;
    }
    tx.add(...closeOfferRes.instructions);
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
  auctionHouse?: AuctionHouse | null;
}

export interface AcceptOfferResponse {
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

  const onAcceptOffer = async ({ auctionHouse, nft }: AcceptOfferParams) => {
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

    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const res: TxRes = await nightmarketClient.AcceptOffer(
      new PublicKey(nft.mintAddress),
      toSol(Number(offer.price), 9),
      new PublicKey(nft.owner),
      publicKey
    );

    if (!!res.err) {
      toast(res.err, { type: 'error' });
      return;
    }

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
      instructions: res.instructions,
    }).compileToV0Message(res.ltAccounts);

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
            auctionHouseAddress: auctionHouse.address,
            auctionHouseProgram: config.auctionHouseProgram ?? '',
            blockTimestamp,
            price: offer.price,
            signature: settledSignedTxs.fulfilled[acceptOfferIndex].tx,
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
      return { acceptAction };
    }
  };

  return {
    acceptingOffer,
    onAcceptOffer,
  };
}
