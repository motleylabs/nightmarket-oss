import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import useLogin from './login';
import { useWallet } from '@solana/wallet-adapter-react';

interface OfferForm {
  amount: number;
}

interface MakeOfferContext {
  makeOffer: boolean;
  registerOffer: UseFormRegister<OfferForm>;
  handleSubmitOffer: UseFormHandleSubmit<OfferForm>;
  onMakeOffer: () => void;
  onCancelOffer: () => void;
  offerFormState: FormState<OfferForm>;
}

export default function useMakeOffer(): MakeOfferContext {
  const { connected } = useWallet();
  const login = useLogin();
  const [makeOffer, setMakeOffer] = useState(false);
  const {
    register: registerOffer,
    handleSubmit: handleSubmitOffer,
    reset,
    formState: offerFormState,
  } = useForm<OfferForm>();

  const onMakeOffer = useCallback(() => {
    if (connected) {
      return setMakeOffer(true);
    }

    return login();
  }, [setMakeOffer, connected, login]);
  const onCancelOffer = useCallback(() => {
    reset();
    setMakeOffer(false);
  }, [setMakeOffer, reset]);

  return {
    registerOffer,
    offerFormState,
    makeOffer,
    onMakeOffer,
    onCancelOffer,
    handleSubmitOffer,
  };
}
