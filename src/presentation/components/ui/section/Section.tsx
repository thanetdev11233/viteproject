import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../../../utils/cn'
import { Container } from '../container/Container'

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  containerClassName?: string
  containerSize?: 'default' | 'wide' | 'narrow'
}

export function Section({
  children,
  className,
  containerClassName,
  containerSize = 'default',
  ...props
}: SectionProps) {
  return (
    <section className={cn('py-16 sm:py-20 lg:py-24', className)} {...props}>
      <Container className={containerClassName} size={containerSize}>
        {children}
      </Container>
    </section>
  )
}
