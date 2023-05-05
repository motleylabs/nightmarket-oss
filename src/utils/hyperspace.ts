import axios from 'axios';
import { Base64 } from 'js-base64';

interface BuyNowResult {
  buffer?: Buffer;
  error?: string;
}

export const getBuyNowTransaction = async (
  auctionHouseProgram: string,
  auctionHouseAddress: string,
  seller: string,
  buyer: string,
  price: string,
  tokenAddress: string
): Promise<BuyNowResult> => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_ANDROMEDA_ENDPOINT}/nfts/buy`,
      {
        auctionHouseProgram: auctionHouseProgram,
        auctionHouseAddress: auctionHouseAddress,
        seller: seller,
        buyer,
        buyerBroker: buyer,
        price,
        mint: tokenAddress,
      },
      {
        validateStatus: function (status) {
          return true;
        },
      }
    );

    if (data.error) {
      return { error: data.error };
    }

    if (data.buffer.length > 0) {
      return { buffer: Buffer.from(Base64.toUint8Array(data.buffer)) };
    }
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.error(e);
    return {};
  }

  return {};
};
