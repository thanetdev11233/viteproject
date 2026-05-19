import type { PortfolioPageData } from '../entities/portfolio'

export interface PortfolioRepository {
  getPortfolioPageData(): PortfolioPageData
}
