import { useRouter } from 'next/router';
import useSWRInfinite from 'swr/infinite';

import type { NftActivitiesData } from '../../typings';

const PAGE_LIMIT = 24;

export const useActivities = () => {
  const { query } = useRouter();

  const getKey = (pageIndex: number, previousPageData: NftActivitiesData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    return `/nfts/activities?address=${query.address}&limit=${PAGE_LIMIT}&offset=${
      pageIndex * PAGE_LIMIT
    }`;
  };

  const data = useSWRInfinite<NftActivitiesData>(getKey, {
    revalidateOnFocus: false,
  });

  const handleShowMoreActivities = () => {
    data.setSize(data.size + 1);
  };

  return { ...data, handleShowMoreActivities };
};
