/* eslint-disable no-console */
import { useConnection } from '@solana/wallet-adapter-react';
import { useState } from 'react';

import config from '../app.config';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, Nft } from '../typings';
import { getBuyNowTransaction } from '../utils/hyperspace';
import { sendVersionedTransactionWithRetry } from '../utils/transactions';
import type { BuyListingResponse } from './buy';
import { VersionedTransaction } from '@solana/web3.js';

interface HSBuyParams {
  nft: Nft;
  listing: ActionInfo | null;
}

interface HSBuyContext {
  buying: boolean;
  onHSBuyNow: ({ nft, listing }: HSBuyParams) => Promise<BuyListingResponse | undefined>;
}

async function versionedTransactionFromBuyBuffer(
  buffer: Buffer
): Promise<VersionedTransaction> {
  const tx = VersionedTransaction.deserialize(buffer);
  return tx;
}

export default function useHSBuyNow(): HSBuyContext {
  const wallet = useWalletContext();
  const { connection } = useConnection();
  const [buying, setBuying] = useState<boolean>(false);

  const onHSBuyNow = async ({
    nft,
    listing,
  }: HSBuyParams): Promise<BuyListingResponse | undefined> => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction || !nft || !listing) {
      throw new Error('not all params provided');
    }

    setBuying(true);

    const buyNowTxBuffer = await getBuyNowTransaction(
      listing.auctionHouseProgram,
      listing.auctionHouseAddress,
      listing.userAddress,
      wallet.publicKey.toBase58(),
      listing.price,
      nft.mintAddress
    );

    console.log({ buyNowTxBuffer });

    if (!!buyNowTxBuffer) {
      try {
        const tx = await versionedTransactionFromBuyBuffer(
          buyNowTxBuffer
        );

        const { txid } = await sendVersionedTransactionWithRetry(connection, wallet, tx);

        if (!!txid) {
          // eslint-disable-next-line no-console
          console.log('Buynow signature: ', txid);

          return {
            buyAction: {
              auctionHouseAddress: config.auctionHouse,
              auctionHouseProgram: config.auctionHouseProgram ?? '',
              blockTimestamp: Math.floor(new Date().getTime() / 1000),
              price: listing.price,
              signature: txid,
              userAddress: wallet.publicKey.toBase58(),
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
