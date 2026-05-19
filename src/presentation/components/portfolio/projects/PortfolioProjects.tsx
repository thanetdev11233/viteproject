import type { ProjectItem } from '../../../../domain/models/portfolio'
import { cn } from '../../../../utils/cn'
import { Button } from '../../ui/button/Button'
import { Section } from '../../ui/section/Section'
import { SectionHeading } from '../../ui/section-heading/SectionHeading'

type PortfolioProjectsProps = {
  projects: ProjectItem[]
}

export function PortfolioProjects({ projects }: PortfolioProjectsProps) {
  return (
    <Section
      id="projects"
      className="pb-20 pt-10 sm:pb-24 lg:pb-28"
      containerClassName="max-w-[1040px]"
    >
      <div className="flex flex-col gap-14 lg:gap-20">
        <SectionHeading title="Projects" />

        <div className="flex flex-col gap-8 lg:gap-20">
          {projects.map((project) => (
            <article
              key={`${project.title}-${project.imageAlt}`}
              className="surface-card overflow-hidden"
            >
              <div
                className={cn(
                  'grid min-h-[32.75rem]',
                  'lg:grid-cols-2',
                  project.layout === 'image-left' &&
                    'lg:[&>*:first-child]:order-2',
                )}
              >
                <div className="flex items-center">
                  <div className="flex w-full flex-col items-start gap-6 px-7 py-8 sm:px-10 sm:py-10 lg:px-[3.1875rem] lg:py-[9.125rem]">
                    <h3 className="font-display text-[2rem] font-bold leading-[1.25] text-text-primary lg:text-[2.5rem]">
                      {project.title}
                    </h3>

                    <p className="max-w-[25rem] font-body text-lg leading-8 text-text-muted">
                      {project.description}
                    </p>

                    <Button
                      className="rounded-full"
                      href={project.href}
                      size="sm"
                      variant="outline"
                    >
                      View Project
                    </Button>
                  </div>
                </div>

                <div className="min-h-72 lg:h-full">
                  <img
                    alt={project.imageAlt}
                    className="h-full w-full object-cover"
                    src={project.image}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}
