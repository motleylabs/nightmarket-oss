import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import useLogin from './login';
import { useWallet } from '@solana/wallet-adapter-react';

interface ListNftForm {
  amount: number;
}

interface ListNftContext {
  listNft: boolean;
  registerListNft: UseFormRegister<ListNftForm>;
  handleSubmitListNft: UseFormHandleSubmit<ListNftForm>;
  onListNft: () => void;
  onCancelListNft: () => void;
  listNftState: FormState<ListNftForm>;
}

export default function useListNft(): ListNftContext {
  const { connected } = useWallet();
  const login = useLogin();
  const [listNft, setListNft] = useState(false);
  const {
    register: registerListNft,
    handleSubmit: handleSubmitListNft,
    reset,
    formState: listNftState,
  } = useForm<ListNftForm>();

  const onListNft = useCallback(() => {
    if (connected) {
      return setListNft(true);
    }

    return login();
  }, [setListNft, connected, login]);

  const onCancelListNft = useCallback(() => {
    reset();
    setListNft(false);
  }, [setListNft, reset]);

  return {
    registerListNft,
    listNftState,
    listNft,
    onListNft,
    onCancelListNft,
    handleSubmitListNft,
  };
}
