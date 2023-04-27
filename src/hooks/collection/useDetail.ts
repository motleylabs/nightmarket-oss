import useSWR from 'swr';

import type { Collection } from '../../typings';

export const useDetail = (slug: string) =>
  useSWR<Collection>(`/collections/${slug}`, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    refreshInterval: 600000,
  });
