import { TailSpin } from 'react-loader-spinner';
import clsx from 'clsx';
import { useMemo } from 'react';

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Ghost = 'ghost',
}

export enum ButtonSize {
  Small = 'sm',
  Large = 'lg',
}

interface ButtonProps {
  children?: any;
  htmlType?: 'button' | 'submit' | 'reset' | undefined;
  size?: ButtonSize;
  block?: boolean;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactElement;
  className?: string;
  onClick?: () => any;
  circle?: boolean;
  secondaryBgColor?: 'bg-black' | 'bg-gray-800';
}

const Button = ({
  children,
  icon,
  size = ButtonSize.Large,
  htmlType = 'button',
  disabled = false,
  loading = false,
  type = ButtonType.Primary,
  className,
  block = false,
  circle = false,
  secondaryBgColor = 'bg-gray-800', // only for secondary button
  onClick,
}: ButtonProps): JSX.Element => {
  const spinnerColor: 'white' | 'grey' | undefined = useMemo(() => {
    switch (type) {
      case ButtonType.Primary:
        return 'grey';
      case ButtonType.Secondary:
        return 'white';
    }
  }, [type]);

  const content = (
    <>
      {loading && (
        <TailSpin
          height="20px"
          width="20px"
          color={spinnerColor}
          ariaLabel="loading"
          wrapperClass="inline aspect-square mr-1"
        />
      )}
      {icon && icon}
      {children}
    </>
  );

  return (
    <button
      className={clsx(
        clsx,
        'focus:shadow-outline flex grow-0 items-center justify-center rounded-full text-center transition-transform duration-150',
        className,
        {
          'w-full': block,

          'bg-gradient-primary font-bold text-white': type === ButtonType.Primary,
          'bg-gradient-secondary font-bold': type === ButtonType.Secondary,
          'border border-gray-300 bg-gray-800 font-medium text-gray-300':
            type === ButtonType.Tertiary,
          'border border-gray-800 bg-none text-white': type === ButtonType.Ghost,
          'text-xs md:text-sm': size === ButtonSize.Small,
          'py-2 px-6': !circle && size === ButtonSize.Small && type !== ButtonType.Secondary,
          'py-3 px-6': size === ButtonSize.Large && type !== ButtonType.Secondary,
          'p-px': type === ButtonType.Secondary,
          'opacity-75': disabled,
          'hover:scale-[1.02]': !disabled,
          'h-10 w-10': circle && ButtonSize.Small,
        }
      )}
      disabled={disabled}
      type={htmlType}
      onClick={onClick}
    >
      {!(type === ButtonType.Secondary) ? (
        content
      ) : (
        <div
          className={clsx('h-full w-full  rounded-full', secondaryBgColor, {
            'py-2 px-4': !circle && size === ButtonSize.Small,
            'py-3 px-6': size === ButtonSize.Large,
          })}
        >
          <div className="bg-gradient-secondary bg-clip-text font-bold text-transparent">
            {content}
          </div>
        </div>
      )}
    </button>
  );
};

export default Button;
