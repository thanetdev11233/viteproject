import type { PortfolioPageData } from '../../domain/entities/portfolio'
import type { PortfolioRepository } from '../../domain/repositories/PortfolioRepository'

const heroImage =
  'https://www.figma.com/api/mcp/asset/4f221439-5b50-40e2-91dc-29bfd8b87038'
const projectImageOne =
  'https://www.figma.com/api/mcp/asset/64d1f4f6-14e7-4945-82b7-87440ae06dd0'
const projectImageTwo =
  'https://www.figma.com/api/mcp/asset/26a6aa36-0e84-4811-a2c3-2a6e518a6eb5'
const projectImageThree =
  'https://www.figma.com/api/mcp/asset/b9be0d50-431f-477b-8d0c-19f1c764e8fb'

class StaticPortfolioRepository implements PortfolioRepository {
  getPortfolioPageData(): PortfolioPageData {
    return {
      brand: 'Madelyn Torff',
      copyright: 'Madelyn Torff 2021',
      hero: {
        actions: [
          {
            href: '#projects',
            label: 'Projects',
            variant: 'primary',
          },
          {
            href: 'https://www.linkedin.com/',
            label: 'LinkedIn',
            target: '_blank',
            variant: 'secondary',
          },
        ],
        description:
          'Short text with details about you, what you do or your professional career. You can add more information on the about page.',
        eyebrow: 'UI/UX Designer',
        image: heroImage,
        imageAlt:
          'Madelyn smiling while holding yellow flowers in front of her face.',
        title: 'Hello, my name is Madelyn Torff',
      },
      navigation: [
        { href: '#about', label: 'About' },
        { href: '#projects', label: 'Projects' },
        { href: '#contacts', label: 'Contacts' },
      ],
      projects: [
        {
          description:
            'I created this personal project in order to show how to create an interface in Figma using a portfolio as an example.',
          href: '#projects',
          image: projectImageOne,
          imageAlt:
            'Woman stretching upward while practicing yoga against a marble wall.',
          layout: 'image-right',
          title: 'Project Name',
        },
        {
          description:
            'What was your role, your deliverables, if the project was personal, freelancing.',
          href: '#projects',
          image: projectImageTwo,
          imageAlt:
            'Desk scene with a paper calendar, pen, and illustrated leaves.',
          layout: 'image-left',
          title: 'Project Name',
        },
        {
          description:
            'You can also add in this description the type of the project, if it was for web, mobile, electron.',
          href: '#projects',
          image: projectImageThree,
          imageAlt:
            'Phone resting near a keyboard and mug on a gray table surface.',
          layout: 'image-right',
          title: 'Project Name',
        },
      ],
      socialLinks: [
        {
          href: 'https://www.instagram.com/',
          iconKey: 'instagram',
          label: 'Instagram',
        },
        {
          href: 'https://www.linkedin.com/',
          iconKey: 'linkedin',
          label: 'LinkedIn',
        },
        {
          href: 'mailto:hello@example.com',
          iconKey: 'mail',
          label: 'Email',
        },
      ],
    }
  }
}

export const staticPortfolioRepository = new StaticPortfolioRepository()
