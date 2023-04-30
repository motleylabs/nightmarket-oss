import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import config from '../app.config';
import type { AuctionHouse } from '../typings';
import { getAuctionHouseInfo } from '../utils/auction-house';

type AuctionHouseContextValue = {
  auctionHouse: AuctionHouse | null;
  isLoading: boolean;
  isFetched: boolean;
};
const AuctionHouseContext = createContext<AuctionHouseContextValue>({
  auctionHouse: null,
  isLoading: false,
  isFetched: false,
});

export function AuctionHouseContextProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [auctionHouse, setAuctionHouse] = useState<AuctionHouse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetched, setIsFetched] = useState<boolean>(false);

  useEffect(() => {
    if (wallet.connected && !auctionHouse && !isLoading && !isFetched) {
      setIsLoading(true);
      getAuctionHouseInfo(connection, new PublicKey(config.auctionHouse)).then((res) => {
        setAuctionHouse(res);
        setIsFetched(true);
        setIsLoading(false);
      });
    }
  }, [auctionHouse, connection, isFetched, isLoading, wallet.connected]);

  return (
    <AuctionHouseContext.Provider value={{ auctionHouse, isLoading, isFetched }}>
      {children}
    </AuctionHouseContext.Provider>
  );
}

export function useAuctionHouseContext() {
  return useContext(AuctionHouseContext);
}
