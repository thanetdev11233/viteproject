import type { NavItem } from '../../domain/models/portfolio'
import { cn } from '../../utils/cn'
import { Container } from '../components/ui/container/Container'

type SiteHeaderProps = {
  brand: string
  brandHref?: string
  items: NavItem[]
  className?: string
  navLabel?: string
}

export function SiteHeader({
  brand,
  brandHref = '#top',
  className,
  items,
  navLabel = 'Primary navigation',
}: SiteHeaderProps) {
  return (
    <header className={cn('py-3 sm:py-4', className)}>
      <Container>
        <div className="flex min-h-14 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={brandHref}
            className="font-brand text-lg font-bold leading-8 text-text-primary"
          >
            {brand}
          </a>

          <nav aria-label={navLabel}>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 lg:gap-x-12">
              {items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="font-ui text-[1.125rem] font-medium leading-7 text-text-primary transition-opacity duration-200 hover:opacity-70"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  )
}
