import type { SocialIconKey, SocialLink } from '../../domain/models/portfolio'
import { cn } from '../../utils/cn'
import { Container } from '../components/ui/container/Container'

type SiteFooterProps = {
  className?: string
  copyright: string
  items: SocialLink[]
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.88 1.12a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26ZM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M5.5 3A2.5 2.5 0 1 1 5.5 8 2.5 2.5 0 0 1 5.5 3ZM3.75 9.75h3.5v10.5h-3.5V9.75Zm5.75 0H12.9v1.44h.05c.47-.89 1.63-1.82 3.36-1.82 3.6 0 4.27 2.37 4.27 5.46v5.42h-3.5v-4.8c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.88H9.5V9.75Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M3 5.75A2.75 2.75 0 0 1 5.75 3h12.5A2.75 2.75 0 0 1 21 5.75v12.5A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25V5.75Zm2.22-1.25 6.78 5.23 6.78-5.23H5.22Zm14.28 2.15-7.04 5.42a.75.75 0 0 1-.92 0L4.5 6.65v11.6c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V6.65Z" />
    </svg>
  )
}

function renderSocialIcon(iconKey: SocialIconKey) {
  if (iconKey === 'instagram') {
    return <InstagramIcon />
  }

  if (iconKey === 'linkedin') {
    return <LinkedInIcon />
  }

  return <MailIcon />
}

export function SiteFooter({
  className,
  copyright,
  items,
}: SiteFooterProps) {
  return (
    <footer className={cn('py-14 sm:py-16', className)}>
      <Container size="narrow">
        <div className="flex flex-col items-center gap-6 text-center">
          <ul className="flex items-center justify-center gap-6">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-label={item.label}
                  className="inline-flex size-12 items-center justify-center text-text-primary transition-opacity duration-200 hover:opacity-70"
                >
                  {renderSocialIcon(item.iconKey)}
                </a>
              </li>
            ))}
          </ul>

          <p className="font-body text-base leading-6 text-text-muted">
            {copyright}
          </p>
        </div>
      </Container>
    </footer>
  )
}
