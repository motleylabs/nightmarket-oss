import { TailSpin } from 'react-loader-spinner';
import clsx from 'clsx';

export enum ButtonBackground {
  Gradient = 'bg-gradient',
  Black = 'bg-black',
  Slate = 'bg-gray-800',
}

export enum ButtonColor {
  Gradient = 'gradient',
  White = 'text-white',
  Gray = 'text-neutral-300',
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
  return (
    <button
      className={clsx(
        clsx,
        'flex grow-0 items-center justify-center rounded-full text-center',
        className,
        color,
        {
          [background]: !border,
          [color]: color !== ButtonColor.Gradient,
          'border-gradient p-[2px]': border === ButtonBorder.Gradient,
          'border border-neutral-300 bg-none': border === ButtonBorder.Gray,
          'w-full': block,
          'py-1 px-4 text-xs': size === ButtonSize.Tiny && border !== ButtonBorder.Gradient,
          'py-1 px-4 text-xs md:text-sm':
            size === ButtonSize.Small && border !== ButtonBorder.Gradient,
          'py-3 px-6': size === ButtonSize.Large && border !== ButtonBorder.Gradient,
          'opacity-75': disabled,
          'hover:scale-[1.02]': !disabled,
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
            'py-1 px-4 text-xs': size === ButtonSize.Tiny && border === ButtonBorder.Gradient,
            'py-1 px-4 text-xs md:text-sm':
              size === ButtonSize.Small && border === ButtonBorder.Gradient,
            'py-3 px-6': size === ButtonSize.Large && border === ButtonBorder.Gradient,
          }
        )}
      >
        {loading && (
          <TailSpin
            height="20px"
            width="20px"
            color={color !== ButtonColor.Gradient ? color : 'text-primary-700'}
            ariaLabel="loading"
            wrapperClass="inline aspect-square mr-1"
          />
        )}
        {icon && icon}
        {children && (
          <span
            className={clsx({
              'border-gradient bg-clip-text text-transparent': color === ButtonColor.Gradient,
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
