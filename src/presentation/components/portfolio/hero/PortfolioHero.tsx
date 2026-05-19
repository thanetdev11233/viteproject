import type { HeroContent } from '../../../../domain/models/portfolio'
import { Button } from '../../ui/button/Button'
import { Container } from '../../ui/container/Container'

type PortfolioHeroProps = {
  hero: HeroContent
}

export function PortfolioHero({ hero }: PortfolioHeroProps) {
  return (
    <section
      id="about"
      className="overflow-hidden pb-20 pt-4 sm:pb-24 lg:pb-28 lg:pt-6"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[486px_minmax(0,1fr)] lg:gap-8">
          <div className="order-2 flex flex-col items-start gap-3 lg:order-1 lg:pt-4">
            <p className="font-body text-xl font-bold uppercase leading-6 tracking-[0.02em] text-brand-yellow">
              {hero.eyebrow}
            </p>

            <div className="flex flex-col gap-8">
              <h1 className="max-w-[15ch] text-balance font-display text-[3.25rem] font-bold leading-[1.15] text-text-primary sm:text-[4rem]">
                {hero.title}
              </h1>

              <p className="max-w-xl font-body text-xl leading-9 text-text-muted sm:text-2xl">
                {hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {hero.actions.map((action) => (
                  <Button
                    key={action.label}
                    href={action.href}
                    size="sm"
                    target={action.target}
                    rel={
                      action.target === '_blank'
                        ? 'noreferrer noopener'
                        : undefined
                    }
                    variant={action.variant}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative h-[22rem] w-full max-w-[28rem] sm:h-[30rem] sm:max-w-[34rem] lg:h-[39.25rem] lg:max-w-[45rem]">
              <div className="hero-blob absolute -right-[6%] top-0 h-full w-[108%] bg-brand-yellow" />
              <img
                alt={hero.imageAlt}
                className="absolute bottom-0 right-[3%] z-10 h-[92%] w-auto max-w-none object-contain sm:right-[5%] lg:right-0"
                src={hero.image}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
