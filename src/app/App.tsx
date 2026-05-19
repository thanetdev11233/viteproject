import { getPortfolioPageData } from '../application/usecases/getPortfolioPageData'
import { staticPortfolioRepository } from '../infrastructure/repositories/StaticPortfolioRepository'
import { DashboardPage } from '../presentation/pages/dashboard/DashboardPage'
import { PortfolioPage } from '../presentation/pages/portfolio/PortfolioPage'

export default function App() {
  if (window.location.pathname.startsWith('/dashboard')) {
    return <DashboardPage />
  }

  const portfolioPageData = getPortfolioPageData(staticPortfolioRepository)

  return <PortfolioPage data={portfolioPageData} />
}
