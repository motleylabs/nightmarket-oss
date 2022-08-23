import clsx from "clsx";
import { DetailedHTMLProps, InputHTMLAttributes, FormHTMLAttributes, LabelHTMLAttributes } from "react";

export function Form({ children , ...props }: DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>): JSX.Element {
  return <form {...props}>{children}</form>
}

interface FormLabelProps extends DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {
  name: string;
}

function FormLabel({ name, className, children, ...props }: FormLabelProps): JSX.Element {
  return (
    <label className="flex flex-col gap-2 mb-6">
      <span className="font-semibold text-white">{name}</span>
      {children}
    </label>
  )
}

Form.Label = FormLabel;

interface FormInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
}

function FormInput({ className, ...props }: FormInputProps): JSX.Element {
  return <input {...props} className={clsx('border border-gray-800 rounded-lg p-2 text-white w-full bg-gray-900', className)} />
}

Form.Input = FormInput;