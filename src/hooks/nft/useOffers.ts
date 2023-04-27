import useSWR from 'swr';

import type { Offer } from '../../typings';

export const useOffers = (address: string) =>
  useSWR<Offer[]>(address !== '' ? `/nfts/offers?address=${address}` : null, {
    revalidateOnFocus: false,
  });
