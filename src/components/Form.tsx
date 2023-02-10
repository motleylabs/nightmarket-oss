import clsx from 'clsx';
import {
  DetailedHTMLProps,
  FormHTMLAttributes,
  LabelHTMLAttributes,
  forwardRef,
  LegacyRef,
  InputHTMLAttributes,
} from 'react';
import { FieldError } from 'react-hook-form';

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

interface FormErrorProps {
  message?: string;
}

function FormError({ message }: FormErrorProps): JSX.Element | null {
  if (message) {
    return <p className="whitespace-nowrap text-left text-sm text-red-500">{message}</p>;
  }

  return null;
}

Form.Error = FormError;

Form.Label = FormLabel;

interface FormInputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  className?: string;
  icon?: JSX.Element;
  error?: FieldError;
  font?: boolean;
}

const FormInput = forwardRef(function FormInput(
  { className, icon, error, font, ...props }: FormInputProps,
  ref
) {
  return (
    <div
      className={clsx(
        'input flex w-full flex-row items-center justify-start rounded-lg border border-gray-800 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
        { 'focus-within:border-red-500': error },
        className
      )}
    >
      {icon && icon}
      <input
        {...props}
        ref={ref as LegacyRef<HTMLInputElement> | undefined}
        className={clsx('w-full bg-transparent', { 'pl-2': icon, 'text-base': font })}
      />
    </div>
  );
});

Form.Input = FormInput;
