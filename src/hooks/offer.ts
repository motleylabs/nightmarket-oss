import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import useLogin from './login';
import { useWallet } from '@solana/wallet-adapter-react';

interface OfferForm {
  amount: string;
}

const schema = zod.object({
  amount: zod
    .string()
    .min(1, `Must enter an amount`)
    .regex(/^[0-9.]*$/, { message: `Must be a number` }),
});

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
  } = useForm<OfferForm>({
    resolver: zodResolver(schema),
  });

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
