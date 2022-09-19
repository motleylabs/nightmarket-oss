import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import { FormState, useForm, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import useLogin from './login';

interface BuyForm {
  amount: number;
}

interface BuyContext {
  buy: boolean;
  registerBuy: UseFormRegister<BuyForm>;
  handleSubmitBuy: UseFormHandleSubmit<BuyForm>;
  onBuyNow: () => void;
  onCancelBuy: () => void;
  buyFormState: FormState<BuyForm>;
}

export default function useBuyNow(): BuyContext {
  const { connected } = useWallet();
  const login = useLogin();
  const [buy, setBuy] = useState(false);
  const {
    register: registerBuy,
    handleSubmit: handleSubmitBuy,
    reset,
    formState: buyFormState,
  } = useForm<BuyForm>();

  const onBuyNow = useCallback(() => {
    if (connected) {
      console.log(`hit buyNow`);
      // TODO buy flow
      return setBuy(true);
    }
    return login();
  }, [setBuy, connected, login]);

  const onCancelBuy = useCallback(() => {
    reset();
    setBuy(false);
  }, [setBuy, reset]);

  return {
    registerBuy,
    buyFormState,
    buy,
    onBuyNow,
    onCancelBuy,
    handleSubmitBuy,
  };
}
