import { NightmarketClient, Offer } from '@motleylabs/mtly-nightmarket';
import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      buyer,
      seller,
      price,
      signature,
      blockTimestamp,
      auctionHouseProgram,
      auctionHouseAddress,
    } = req.query;

    if (
      !buyer ||
      !price ||
      !signature ||
      !blockTimestamp ||
      !auctionHouseProgram ||
      !auctionHouseAddress
    ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let buyerPublicKey;
    let sellerPublicKey;
    let priceNumber = Number(price);

    if (isNaN(priceNumber)) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    try {
      buyerPublicKey = new PublicKey(seller as string);
      if (seller) sellerPublicKey = new PublicKey(seller as string);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid buyer or seller public key' });
    }

    try {
      const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);

      const offer: Offer = {
        seller: seller as string,
        buyer: buyer as string,
        price: Number(price),
        signature: signature as string,
        blockTimestamp: Number(blockTimestamp),
        auctionHouseProgram: auctionHouseProgram as string,
        auctionHouseAddress: auctionHouseAddress as string,
      };

      const val: boolean = nightmarketClient.IsLocalOffer(offer);

      res.status(200).json({ isLocalOffer: val });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
