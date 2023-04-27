import useSWR from 'swr';

import type { CollectionSeriesData } from '../../typings';

export const useSeries = (
  slug: string,
  startTime: number,
  endTime: number,
  granularity: string,
  limit: number
) =>
  useSWR<CollectionSeriesData>(
    `/collections/series?address=${slug}&from_time=${startTime}&to_time=${endTime}&granularity=${granularity}&limit=${limit}&offset=0`,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      refreshInterval: 300000,
    }
  );
