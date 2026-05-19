import type { PortfolioPageData } from '../../../domain/entities/portfolio'
import { PortfolioHero } from '../../components/portfolio/hero/PortfolioHero'
import { PortfolioProjects } from '../../components/portfolio/projects/PortfolioProjects'
import { SiteFooter } from '../../layouts/SiteFooter'
import { SiteHeader } from '../../layouts/SiteHeader'

type PortfolioPageProps = {
  data: PortfolioPageData
}

export function PortfolioPage({ data }: PortfolioPageProps) {
  const { brand, copyright, hero, navigation, projects, socialLinks } = data

  return (
    <div id="top" className="min-h-screen bg-canvas">
      <SiteHeader brand={brand} items={navigation} />

      <main>
        <PortfolioHero hero={hero} />
        <PortfolioProjects projects={projects} />
      </main>

      <SiteFooter className="pt-4" copyright={copyright} items={socialLinks} />
    </div>
  )
}
