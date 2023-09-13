import { Action, NightmarketClient } from '@motleylabs/mtly-nightmarket';
import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { price, mint, seller, buyer } = req.query;

    if (!price || !mint || !seller || !buyer) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let mintPublicKey;
    let sellerPublicKey;
    let buyerPublicKey;
    let priceNumber;

    priceNumber = Number(price);

    if (isNaN(priceNumber)) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    try {
      mintPublicKey = new PublicKey(mint as string);
      sellerPublicKey = new PublicKey(seller as string);
      buyerPublicKey = new PublicKey(buyer as string);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid mint, seller or buyer public key' });
    }

    try {
      const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);

      const txRes: Action = await nightmarketClient.CloseOffer(
        mintPublicKey,
        priceNumber,
        sellerPublicKey,
        buyerPublicKey
      );

      if (!!txRes.err) {
        return res.status(400).json({ error: txRes.err });
      }

      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com/'
      );

      const { blockhash } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: buyerPublicKey,
        recentBlockhash: blockhash,
        instructions: txRes.instructions,
      }).compileToV0Message(txRes.altAccounts);

      const transactionV0 = new VersionedTransaction(messageV0);

      res.status(200).json({ tx: transactionV0.serialize() });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
