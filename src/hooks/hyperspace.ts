import { useConnection } from '@solana/wallet-adapter-react';
import {
  AddressLookupTableAccount,
  Message,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { useState } from 'react';
import { toast } from 'react-toastify';

import config from '../app.config';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, Nft } from '../typings';
import { getBuyNowTransaction } from '../utils/hyperspace';
import { reduceSettledPromise } from '../utils/promises';
import { queueVersionedTransactionSign } from '../utils/transactions';
import type { BuyListingResponse } from './buy';
import { TX_INTERVAL } from './list';

interface HSBuyParams {
  nft: Nft;
  listing: ActionInfo | null;
}

interface HSBuyContext {
  buying: boolean;
  onHSBuyNow: ({ nft, listing }: HSBuyParams) => Promise<BuyListingResponse | undefined>;
}

export default function useHSBuyNow(): HSBuyContext {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWalletContext();
  const { connection } = useConnection();
  const [buying, setBuying] = useState<boolean>(false);

  const onHSBuyNow = async ({
    nft,
    listing,
  }: HSBuyParams): Promise<BuyListingResponse | undefined> => {
    if (!connected || !publicKey || !signTransaction || !nft || !listing) {
      throw new Error('not all params provided');
    }

    setBuying(true);

    const buyNowTxBuffer = await getBuyNowTransaction(
      publicKey.toBase58(),
      listing.price,
      nft.mintAddress
    );

    console.log({ buyNowTxBuffer });

    if (!!buyNowTxBuffer) {
      try {
        const HYPERSPACE_LUT_STRING = 'aCJ2zmwdwXYEJLpnbwM4D7zVQqouAvwfv8LJ7Qi5LPg';
        const recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
        const tx = Transaction.populate(Message.from(Buffer.from(buyNowTxBuffer)));
        const lut = await connection.getAddressLookupTable(new PublicKey(HYPERSPACE_LUT_STRING));
        const v0Message = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: recentBlockhash,
          instructions: tx.instructions,
        }).compileToV0Message([lut.value as AddressLookupTableAccount]);
        const transaction = new VersionedTransaction(v0Message);

        const pendingSigned = await queueVersionedTransactionSign({
          transactions: [transaction],
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
          toast('Burchased NFT', { type: 'success' });

          return {
            buyAction: {
              auctionHouseAddress: config.auctionHouse,
              auctionHouseProgram: config.auctionHouseProgram ?? '',
              blockTimestamp: Math.floor(new Date().getTime() / 1000),
              price: listing.price,
              signature: settledSignedTxs.fulfilled[0],
              userAddress: publicKey.toBase58(),
            },
          };
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        setBuying(false);
      }
    }

    setBuying(false);
  };

  return {
    buying,
    onHSBuyNow,
  };
}
