import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../../../utils/cn'

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  subtitle?: ReactNode
  centered?: boolean
}

export function SectionHeading({
  centered = true,
  className,
  subtitle,
  title,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        centered ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
      {...props}
    >
      <h2 className="font-display text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
        {title}
      </h2>
      <div className="h-1 w-24 rounded-full bg-brand-yellow" aria-hidden="true" />
      {subtitle ? (
        <p className="max-w-2xl font-body text-base leading-7 text-text-muted sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
