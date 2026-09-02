import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/theme'
import {
  AboutPage,
  BlogPage,
  CareersPage,
  CaseStudiesPage,
  ContactPage,
  FAQPage,
  FeaturesPage,
  FindLawyerPage,
  LandingPage,
  LawyerProfilePage,
  PracticeAreasPage,
  PricingPage,
  PrivacyPage,
  SolutionsPage,
  TermsPage,
} from './PublicPages'

const PAGE_PATHS: Record<string, string> = {
  landing: '/',
  login: '/login',
  register: '/register',
  contact: '/contact',
  'practice-areas': '/practice-areas',
  'case-studies': '/case-studies',
  about: '/about',
  'find-lawyer': '/find-lawyer',
  'lawyer-profile': '/lawyer-profile',
  pricing: '/pricing',
  features: '/features',
  solutions: '/solutions',
  blog: '/blog',
  'faq-page': '/faq',
  careers: '/careers',
  privacy: '/privacy',
  terms: '/terms',
  dashboard: '/dashboard',
  workspace: '/workspace',
  'ai-chat': '/ai-chat',
  'similar-cases': '/similar-cases',
  prediction: '/prediction',
}

const PAGES = {
  landing: LandingPage,
  about: AboutPage,
  'practice-areas': PracticeAreasPage,
  'case-studies': CaseStudiesPage,
  contact: ContactPage,
  'find-lawyer': FindLawyerPage,
  'lawyer-profile': LawyerProfilePage,
  pricing: PricingPage,
  features: FeaturesPage,
  solutions: SolutionsPage,
  blog: BlogPage,
  faq: FAQPage,
  careers: CareersPage,
  privacy: PrivacyPage,
  terms: TermsPage,
} as const

export type FigmaPublicPageName = keyof typeof PAGES

export default function FigmaPublicPage({ page }: { page: FigmaPublicPageName }) {
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()
  const Page = PAGES[page]
  const navigateFromFigma = (destination: string) => {
    navigate(PAGE_PATHS[destination] ?? `/${destination}`)
  }

  return <Page navigate={navigateFromFigma} dark={dark} toggleDark={toggleDark} />
}
