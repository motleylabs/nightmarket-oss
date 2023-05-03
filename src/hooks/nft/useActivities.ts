import { useRouter } from 'next/router';
import useSWR from 'swr';

import type { NftActivitiesData } from '../../typings';

export const useActivities = () => {
  const { query } = useRouter();

  return useSWR<NftActivitiesData>(`/nfts/activities?address=${query.address}`, {
    refreshInterval: 10 * 1000,
  });
};
