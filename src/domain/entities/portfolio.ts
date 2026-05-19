import type {
  HeroContent,
  NavItem,
  ProjectItem,
  SocialLink,
} from '../models/portfolio'

export type PortfolioPageData = {
  brand: string
  copyright: string
  hero: HeroContent
  navigation: NavItem[]
  projects: ProjectItem[]
  socialLinks: SocialLink[]
}
