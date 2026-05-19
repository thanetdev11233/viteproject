import type { PortfolioPageData } from '../../domain/entities/portfolio'
import type { PortfolioRepository } from '../../domain/repositories/PortfolioRepository'

export function getPortfolioPageData(
  repository: PortfolioRepository,
): PortfolioPageData {
  return repository.getPortfolioPageData()
}
