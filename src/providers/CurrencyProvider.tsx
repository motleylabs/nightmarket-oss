import { CoinGeckoClient } from 'coingecko-api-v3';
import React, { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { asUsdString } from '../modules/number';

const COIN_GECKO_CURRENCY_IDS: { [key: string]: string } = {
  SOL: 'solana',
  USD: 'usd',
};

interface ICurrencyContext {
  /**
   * false until all currencies have been loaded
   */
  initialized: boolean;

  /**
   * Sol Price
   */
  solPrice(): number;

  /**
   * @param sol SOL amount to convert to USD
   * @returns USD equivalent value of given SOL
   * @throws if the SOL/USD exchange rate could not be loaded
   */
  solToUsd(sol: number): number;

  /**
   * @param sol SOL amount to convert to USD string
   * @returns USD equivalent value of given SOL formatted like $123,456.78
   * @throws if the SOL/USD exchange rate could not be loaded
   */
  solToUsdString(sol: number): string;
}

export const CurrencyContext = React.createContext<ICurrencyContext | null>(null);

interface CurrencyProviderProps {
  children: ReactNode;
}

export default function CurrencyProvider(props: CurrencyProviderProps): JSX.Element {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [solPrice, setSolPrice] = useState<number>();

  useEffect(() => {
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });
    client
      .simplePrice({
        ids: COIN_GECKO_CURRENCY_IDS.SOL,
        vs_currencies: COIN_GECKO_CURRENCY_IDS.USD,
      })
      .then((r) => {
        setSolPrice(r[COIN_GECKO_CURRENCY_IDS.SOL][COIN_GECKO_CURRENCY_IDS.USD]);
      })
      .finally(() => setInitialized(true));
  }, [setSolPrice, setInitialized]);

  const getSolPrice: ICurrencyContext['solPrice'] = useCallback(() => {
    if (solPrice == null) {
      return NaN;
      throw new Error('SOL price not available.');
    }
    return solPrice * 1;
  }, [solPrice]);

  const solToUsd: ICurrencyContext['solToUsd'] = useCallback(
    (sol) => {
      if (solPrice == null) {
        return NaN;
        throw new Error('No known conversion rate from SOL to USD.');
      }
      return sol * solPrice;
    },
    [solPrice]
  );

  const solToUsdString: ICurrencyContext['solToUsdString'] = useCallback(
    (sol) => asUsdString(solToUsd(sol)),
    [solToUsd]
  );

  return (
    <CurrencyContext.Provider
      value={{ initialized, solPrice: getSolPrice, solToUsd, solToUsdString }}
    >
      {props.children}
    </CurrencyContext.Provider>
  );
}
