import useSWR from 'swr';

import type { CollectionsTrendsData } from '../../typings';

export const useTrendingSearch = (searchTerm: string) =>
  useSWR<CollectionsTrendsData>(
    !searchTerm ? `collections/trend?period=1d&sort_by=volume&order=desc&limit=10&offset=0` : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      refreshInterval: 600000,
    }
  );
