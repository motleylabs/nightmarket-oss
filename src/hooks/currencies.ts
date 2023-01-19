import { useContext } from 'react';
import { CurrencyContext } from '../providers/CurrencyProvider';

export function useCurrencies() {
  const context = useContext(CurrencyContext);

  if (context === null) {
    throw new Error('useCurrencies must be used within an CurrencyProvider');
  }

  return context;
}
