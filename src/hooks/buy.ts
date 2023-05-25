import { NightmarketClient, TxRes } from '@motleylabs/mtly-nightmarket';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { toSol } from '../modules/sol';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { AuctionHouse } from '../typings';
import type { ActionInfo, ErrorWithLogs, Nft } from '../typings';
import { reduceSettledPromise } from '../utils/promises';
import { queueVersionedTransactionSign } from '../utils/transactions';
import { TX_INTERVAL } from './list';
import { useCachedBuddy } from './referrals';

interface BuyForm {
  amount?: number;
}

interface BuyListedForm extends BuyForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
  listing: ActionInfo;
}

export interface BuyListingResponse {
  buyAction: ActionInfo | null;
}

interface BuyContext {
  buy: boolean;
  buying: boolean;
  onBuyNow: ({
    listing,
    nft,
    auctionHouse,
  }: BuyListedForm) => Promise<BuyListingResponse | undefined>;
  onOpenBuy: () => void;
  onCloseBuy: () => void;
}

export default function useBuyNow(): BuyContext {
  const { connected, publicKey, address, signTransaction, signAllTransactions } =
    useWalletContext();
  const { connection } = useConnection();
  const [buy, setBuy] = useState(false);
  const [buying, setBuying] = useState(false);

  const { linkBuddy } = useCachedBuddy({
    wallet: address as string,
  });

  const onBuyNow = async ({
    nft,
    auctionHouse,
    listing: curListing,
  }: BuyListedForm): Promise<BuyListingResponse | undefined> => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !nft ||
      !nft.owner ||
      !auctionHouse.rewardCenter
    ) {
      toast('Required data is missing to take buyNow action', { type: 'error' });
      throw new Error('not all params provided');
    }

    setBuying(true);
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? '');
    const txRes: TxRes = await nightmarketClient.BuyListing(
      new PublicKey(nft.mintAddress),
      toSol(Number(curListing.price), 9),
      new PublicKey(nft.owner),
      publicKey
    );

    if (!!txRes.err) {
      toast(txRes.err, { type: 'error' });
      return;
    }

    let buyTxIndex = 0;
    const transactions: VersionedTransaction[] = [];
    try {
      const signedBuddyTx = await linkBuddy();
      if (signedBuddyTx) {
        transactions.push(signedBuddyTx);
        buyTxIndex = 1;
      }
    } catch (e) {}

    let buyAction: ActionInfo | null = null;
    try {
      const { blockhash } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: txRes.instructions,
      }).compileToV0Message(txRes.ltAccounts);

      const transactionV0 = new VersionedTransaction(messageV0);

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
        toast('NFT purchased', { type: 'success' });

        if (buyTxIndex < settledSignedTxs.fulfilled.length) {
          const blockTimestamp = Math.floor(new Date().getTime() / 1000);

          buyAction = {
            auctionHouseAddress: auctionHouseAddress.toBase58(),
            auctionHouseProgram: config.auctionHouseProgram ?? '',
            blockTimestamp,
            price: curListing.price,
            signature: settledSignedTxs.fulfilled[buyTxIndex].tx,
            userAddress: publicKey?.toBase58() ?? '',
          };
        }
      }
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'NFT purchased',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });
      toast(error.message, { type: 'error' });

      throw err;
    } finally {
      setBuying(false);
      setBuy(false);
      return { buyAction };
    }
  };

  const onOpenBuy = useCallback(() => {
    setBuy(true);
  }, [setBuy]);

  const onCloseBuy = useCallback(() => {
    setBuy(false);
  }, [setBuy]);

  return {
    buy,
    buying,
    onBuyNow,
    onOpenBuy,
    onCloseBuy,
  };
}
