import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

import { cn } from '../../../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonBaseProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

type ButtonAsButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never
  }

type ButtonAsAnchorProps = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-brand-yellow text-text-primary hover:bg-[#f0bb34] focus-visible:outline-text-primary',
  secondary:
    'border-2 border-border-strong bg-surface text-text-primary hover:bg-[#f7f7f7] focus-visible:outline-text-primary',
  outline:
    'border border-border-strong bg-transparent text-text-primary hover:bg-text-primary hover:text-surface focus-visible:outline-text-primary',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-sm',
  md: 'min-h-11 px-6 py-2 text-base',
  lg: 'min-h-12 px-7 py-3 text-lg',
}

export function Button(props: ButtonAsButtonProps): ReactNode
export function Button(props: ButtonAsAnchorProps): ReactNode
export function Button(props: ButtonProps) {
  const {
    children,
    className,
    fullWidth = false,
    size = 'md',
    variant = 'primary',
  } = props

  const classes = cn(
    'inline-flex items-center justify-center rounded-lg font-button font-medium leading-6 transition-colors duration-200',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  )

  if ('href' in props) {
    const {
      children: _children,
      className: _className,
      fullWidth: _fullWidth,
      size: _size,
      variant: _variant,
      ...anchorProps
    } = props as ButtonAsAnchorProps

    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const {
    children: _children,
    className: _className,
    fullWidth: _fullWidth,
    size: _size,
    variant: _variant,
    disabled,
    type = 'button',
    ...buttonProps
  } = props as ButtonAsButtonProps

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  )
}
