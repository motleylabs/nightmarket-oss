import { NightmarketClient, Offer } from '@motleylabs/mtly-nightmarket';
import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { mint } = req.query;

    if (!mint) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let mintPublicKey;

    try {
      mintPublicKey = new PublicKey(mint as string);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid mint public key' });
    }

    try {
      const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);

      const offers: Offer[] | null = await nightmarketClient.GetOffers(mintPublicKey);

      if (!offers) {
        return res.status(404).json({ error: 'There is no offer.' });
      }

      res.status(200).json({ tx: offers });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
