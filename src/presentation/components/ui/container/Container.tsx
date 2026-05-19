import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../../../utils/cn'

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  size?: 'default' | 'wide' | 'narrow'
}

const sizeClasses = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  narrow: 'max-w-4xl',
} as const

export function Container({
  children,
  className,
  size = 'default',
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 sm:px-6 lg:px-10',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
