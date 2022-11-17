import { TailSpin } from 'react-loader-spinner';
import clsx from 'clsx';
import { useMemo } from 'react';

export enum ButtonBackground {
  Gradient = 'bg-gradient-primary hover:bg-gradient-hover focus:bg-gradient-hover disabled:bg-gradient-primary',
  Black = 'bg-black',
  Slate = 'bg-gray-800',
}

export enum ButtonColor {
  Gradient = 'gradient',
  White = 'text-white',
  Gray = 'text-gray-300 hover:text-white group-focus:text-white disabled:text-gray-300',
  Slate = 'text-gray-800',
}

export enum ButtonBorder {
  Gradient = 'gradient',
  Gray = 'gray',
}

export enum ButtonSize {
  Tiny = 'tiny',
  Small = 'small',
  Large = 'large',
}

interface ButtonProps {
  background?: ButtonBackground;
  border?: ButtonBorder;
  color?: ButtonColor;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  icon?: React.ReactElement;
  onClick?: () => any;
  disabled?: boolean;
  circle?: boolean;
  htmlType?: 'button' | 'submit' | 'reset' | undefined;
  className?: string;
  children?: any;
}

const Button = ({
  background = ButtonBackground.Gradient,
  border,
  color = ButtonColor.White,
  size = ButtonSize.Large,
  loading = false,
  block = false,
  icon,
  onClick,
  disabled = false,
  circle = false,
  htmlType = 'button',
  className,
  children,
}: ButtonProps): JSX.Element => {
  const spinnerSize = useMemo(() => {
    switch (size) {
      case ButtonSize.Tiny:
        return '5px';
      case ButtonSize.Small:
        return '10px';
      case ButtonSize.Large:
        return '20px';
    }
  }, [size]);

  return (
    <button
      className={clsx(
        clsx,
        'group flex grow-0 items-center justify-center rounded-full text-center font-bold',
        className,
        color,
        {
          [background]: !border,
          [color]: color !== ButtonColor.Gradient,
          'bg-gradient-secondary p-0.5 hover:bg-gradient-hover focus:bg-gradient-hover disabled:bg-gradient-secondary':
            border === ButtonBorder.Gradient,
          'border-2 border-gray-300 bg-none  hover:border-white active:text-white disabled:border-gray-300 ':
            border === ButtonBorder.Gray,
          'w-full': block,
          'py-1 px-4 text-sm':
            (size === ButtonSize.Tiny || size === ButtonSize.Small) &&
            border !== ButtonBorder.Gradient,
          'py-3 px-6': size === ButtonSize.Large && border !== ButtonBorder.Gradient,
          'disabled:opacity-50': disabled,
          'px-0 py-0': circle,
        }
      )}
      disabled={disabled}
      type={htmlType}
      onClick={onClick}
    >
      <div
        className={clsx(
          'flex h-full w-full grow-0 items-center justify-center gap-1 rounded-full text-center',
          {
            [background]: border === ButtonBorder.Gradient,
            'py-1 px-4 text-sm':
              (size === ButtonSize.Tiny || size === ButtonSize.Small) &&
              border === ButtonBorder.Gradient,
            'py-3 px-6': size === ButtonSize.Large && border === ButtonBorder.Gradient,
          }
        )}
      >
        {loading && (
          <TailSpin
            height={spinnerSize}
            width={spinnerSize}
            color={color !== ButtonColor.Gradient ? 'text-primary-500' : 'text-primary-700'}
            ariaLabel="loading"
            wrapperClass="inline aspect-square mr-1"
          />
        )}
        {icon && icon}
        {children && (
          <span
            className={clsx({
              'text-primary-500 ': color === ButtonColor.Gradient,
            })}
          >
            {children}
          </span>
        )}
      </div>
    </button>
  );
};

export default Button;
