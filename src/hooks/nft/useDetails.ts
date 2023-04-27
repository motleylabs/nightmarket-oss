import useSWR from 'swr';

import type { Nft } from '../../typings';

export const useDetails = (address: string) => useSWR<Nft>(`/nfts/${address}`);
