

import { TailSpin } from 'react-loader-spinner'
import clsx from 'clsx'
import { useMemo } from 'react'

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

export enum ButtonSize {
  Small = 'sm',
  Large = 'lg',
}

interface ButtonProps {
  children?: any
  htmlType?: 'button' | 'submit' | 'reset' | undefined
  size?: ButtonSize
  block?: boolean
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactElement
  className?: string
  onClick?: () => any
  circle?: boolean
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
  onClick,
}: ButtonProps) => {
  const spinnerColor: 'white' | 'grey' | undefined = useMemo(() => {
    switch (type) {
      case ButtonType.Primary:
        return 'grey';
      case ButtonType.Secondary:
        return 'white'
    }
  }, [type])

  return (
    <button
      className={clsx(
        clsx,
        'flex items-center text-center font-semibold justify-center duration-150 rounded-full focus:shadow-outline transition-transform',
        className,
        {
          'w-full': block,
          'text-gray-900 bg-white': type === ButtonType.Primary,
          'text-white bg-gray-800': type === ButtonType.Secondary,
          'text-gray-300 bg-gray-700': type === ButtonType.Tertiary,
          'text-xs md:text-sm p-2': size === ButtonSize.Small,
          'p-4': size === ButtonSize.Large,
          'opacity-75': disabled,
          'hover:scale-105': !disabled,
          'rounded-full': circle,
          'h-10 w-10': circle && ButtonSize.Small
        }
      )}
      disabled={disabled}
      type={htmlType}
      onClick={onClick}
    >
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
    </button>
  )
}

export default Button