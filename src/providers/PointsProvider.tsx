import { createContext, useContext, useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { LeaderBoardPointResponseType } from '../pages/leaderboard';
import { useWalletContext } from './WalletContextProvider';

type PointsContextValue = {
  points: number;
};

const PointContext = createContext<PointsContextValue>({} as PointsContextValue);

export function PointsContextProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWalletContext();
  const [points, setPoints] = useState<number>(0);
  const refreshIntervalTime = 5 * 1000; //5sec

  const getKey = (path: string) => {
    return `${process.env.NEXT_PUBLIC_LEADERBOARD_ENDPOINT}/${path}/${
      address ?? '11111111111111111111111111111111'
    }`;
  };

  const { data: userPointsData } = useSWRInfinite<LeaderBoardPointResponseType>(
    () => getKey('points'),
    { refreshInterval: refreshIntervalTime }
  );

  useEffect(() => {
    if (!address) return;

    if (userPointsData) {
      setPoints(userPointsData[0]?.points ?? 0);
    }
  }, [address, userPointsData]);

  const returnValue = {
    points,
  };

  return <PointContext.Provider value={returnValue}>{children}</PointContext.Provider>;
}

export function usePointContext() {
  return useContext(PointContext);
}
