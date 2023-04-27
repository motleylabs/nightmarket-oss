import useSWR from 'swr';

import type { NftActivitiesData } from '../../typings';

export const useActivities = (address: string) =>
  useSWR<NftActivitiesData>(`/nfts/activities?address=${address}`, {
    revalidateOnFocus: false,
  });
