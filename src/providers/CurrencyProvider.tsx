import { CoinGeckoClient } from 'coingecko-api-v3';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { asUsdString } from '../modules/number';

const COIN_GECKO_CURRENCY_IDS: {[key: string]: string} = {
  SOL: "solana",
  USD: "usd"
}

interface ICurrencyContext {

  /**
   * false until all currencies have been loaded
   */
  initialized: boolean;

  /**
   * @param sol SOL amount to convert to USD
   * @returns USD equivalent value of given SOL
   */
  solToUsd(sol: number): number;

  /**
   * @param sol SOL amount to convert to USD string
   * @returns USD equivalent value of given SOL formatted like $123,456.78
   */
  solToUsdString(sol: number): string;
}

export const CurrencyContext = React.createContext<ICurrencyContext | null>(null);

interface CurrencyProviderProps {
  children: JSX.Element;
}

export default function CurrencyProvider(props: CurrencyProviderProps): JSX.Element {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [solPrice, setSolPrice] = useState<number>();

  useEffect(() => {
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });
    client.simplePrice({
      ids: COIN_GECKO_CURRENCY_IDS.SOL,
      vs_currencies: COIN_GECKO_CURRENCY_IDS.USD
    }).then(r => {
      setSolPrice(r[COIN_GECKO_CURRENCY_IDS.SOL][COIN_GECKO_CURRENCY_IDS.USD]);
    }).finally(() => setInitialized(true));
  }, [setSolPrice, setInitialized]);

  const solToUsd: ICurrencyContext['solToUsd'] = useCallback(
    (sol) => {
      if (solPrice == null) {
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
    <CurrencyContext.Provider value={{ initialized, solToUsd, solToUsdString }}>
      {props.children}
    </CurrencyContext.Provider>
  );
}


export function useCurrencies() {
  const context = useContext(CurrencyContext);

  if (context === null) {
    throw new Error('useCurrencies must be used within an CurrencyProvider');
  }

  return context;
}