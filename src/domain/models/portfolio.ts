export type NavItem = {
  href: string
  label: string
}

export type SocialIconKey = 'instagram' | 'linkedin' | 'mail'

export type SocialLink = {
  href: string
  iconKey: SocialIconKey
  label: string
}

export type HeroAction = {
  href: string
  label: string
  target?: '_blank' | '_self'
  variant: 'primary' | 'secondary'
}

export type HeroContent = {
  actions: HeroAction[]
  description: string
  eyebrow: string
  image: string
  imageAlt: string
  title: string
}

export type ProjectItem = {
  description: string
  href: string
  image: string
  imageAlt: string
  layout: 'image-left' | 'image-right'
  title: string
}
