import { Listing, NightmarketClient } from '@motleylabs/mtly-nightmarket';
import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seller, price, signature, blockTimestamp, auctionHouseProgram, auctionHouseAddress } =
      req.query;

    if (
      !seller ||
      !price ||
      !signature ||
      !blockTimestamp ||
      !auctionHouseProgram ||
      !auctionHouseAddress
    ) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let sellerPublicKey;
    let priceNumber = Number(price);

    if (isNaN(priceNumber)) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    try {
      sellerPublicKey = new PublicKey(seller as string);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid seller public key' });
    }

    try {
      const nightmarketClient = new NightmarketClient(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);

      const listing: Listing = {
        seller: seller as string,
        price: Number(price),
        signature: signature as string,
        blockTimestamp: Number(blockTimestamp),
        auctionHouseProgram: auctionHouseProgram as string,
        auctionHouseAddress: auctionHouseAddress as string,
      };

      const val: boolean = nightmarketClient.IsLocalListing(listing);

      res.status(200).json({ isLocalListing: val });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
