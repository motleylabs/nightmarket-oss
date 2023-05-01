import axios from 'axios';

export const getBuyNowTransaction = async (
  buyer: string,
  price: string,
  tokenAddress: string
): Promise<Buffer | null> => {
  try {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_ANDROMEDA_ENDPOINT}/nfts/buy`, {
      buyer,
      buyerBroker: buyer,
      price,
      mint: tokenAddress,
    });

    if (data.buffer.length > 0) {
      return data.buffer;
    }
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
  return null;
};
