import { TailSpin } from 'react-loader-spinner';
import clsx from 'clsx';

export enum ButtonBackground {
  Gradient = 'bg-gradient',
  Black = 'bg-black',
  Slate = 'bg-gray-800'
}

export enum ButtonColor {
  Gradient = 'gradient',
  White = "text-white",
  Gray = 'text-gray-350',
  Slate = "text-gray-800"
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
        background,
        border,
        color,
        {
          [color]: color !== ButtonColor.Gradient,
          'border-gradient p-[2px]': border === ButtonBorder.Gradient,
          'border border-gray-350 bg-none': border === ButtonBorder.Gray,
          'w-full': block,
          'text-xs py-1 px-4': size === ButtonSize.Tiny && border !== ButtonBorder.Gradient,
          'text-xs md:text-sm py-1 px-4': size === ButtonSize.Small && border !== ButtonBorder.Gradient,
          'py-3 px-6': size === ButtonSize.Large && border !== ButtonBorder.Gradient,
          'opacity-75': disabled,
          'hover:scale-[1.02]': !disabled,
        }
      )}
      disabled={disabled}
      type={htmlType}
      onClick={onClick}
    >
      <div
      className={clsx("flex grow-0 items-center justify-center rounded-full text-center", {
        [background] : border === ButtonBorder.Gradient,
        'text-xs py-1 px-4': size === ButtonSize.Tiny && border === ButtonBorder.Gradient,
          'text-xs md:text-sm py-1 px-4': size === ButtonSize.Small && border === ButtonBorder.Gradient,
          'py-3 px-6': size === ButtonSize.Large && border === ButtonBorder.Gradient,
      })}
      >
        {loading && (
          <TailSpin
            height="20px"
            width="20px"
            color={color !== ButtonColor.Gradient ? color: "text-primary-700"}
            ariaLabel="loading"
            wrapperClass="inline aspect-square mr-1"
          />
        )}
        {icon && icon}
        <span className={clsx({"text-transparent bg-clip-text border-gradient": color === ButtonColor.Gradient})}>
          {children}
        </span>
      </div>
    </button>
  );
};

export default Button;
