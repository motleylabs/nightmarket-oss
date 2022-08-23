import { useCallback, useState } from "react";
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from "react-hook-form";

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
  const [makeOffer, setMakeOffer] = useState(false);
  const { register: registerOffer, handleSubmit: handleSubmitOffer, reset, formState: offerFormState } = useForm<OfferForm>()

  const onMakeOffer = useCallback(() => { setMakeOffer(true) }, [setMakeOffer]);
  const onCancelOffer = useCallback(
    () => {
      reset();
      setMakeOffer(false);
    },
    [setMakeOffer, reset]
  );

  return {
    registerOffer,
    offerFormState,
    makeOffer,
    onMakeOffer,
    onCancelOffer,
    handleSubmitOffer,
  }
}