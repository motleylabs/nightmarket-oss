import clsx from 'clsx';
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  FormHTMLAttributes,
  LabelHTMLAttributes,
  cloneElement,
} from 'react';

export function Form({
  children,
  ...props
}: DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>): JSX.Element {
  return <form {...props}>{children}</form>;
}

interface FormLabelProps
  extends DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> {
  name: string;
}

function FormLabel({ name, className, children, ...props }: FormLabelProps): JSX.Element {
  return (
    <label className="mb-6 flex flex-col gap-2" {...props}>
      <span className="font-semibold text-white">{name}</span>
      {children}
    </label>
  );
}

Form.Label = FormLabel;

interface FormInputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  icon?: JSX.Element;
}

function FormInput({ className, icon, ...props }: FormInputProps): JSX.Element {
  return (
    <div
      className={clsx(
        'flex w-full flex-row items-center justify-start rounded-lg border border-gray-800 bg-gray-900 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
        className
      )}
    >
      {icon && cloneElement(icon, {})}
      <input {...props} className={clsx('w-full bg-transparent', { 'pl-2': icon })} />
    </div>
  );
}

Form.Input = FormInput;
