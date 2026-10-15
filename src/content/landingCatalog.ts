export type LandingKind = 'service' | 'industry'

export interface LandingFaq {
  question: string
  answer: string
}

export interface LandingPageContent {
  slug: string
  kind: LandingKind
  name: string
  eyebrow: string
  headline: string
  description: string
  challenge: string
  approach: string
  capabilities: string[]
  outcomes: string[]
  keywords: string[]
  faqs: LandingFaq[]
}

interface LandingModule {
  default: unknown
}

const landingModules = import.meta.glob<LandingModule>('./landing/*.json', {
  eager: true,
})

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0)

const isFaqArray = (value: unknown): value is LandingFaq[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => {
    if (!item || typeof item !== 'object') return false
    const faq = item as Partial<LandingFaq>
    return typeof faq.question === 'string' && typeof faq.answer === 'string'
  })

const isLandingPage = (value: unknown): value is LandingPageContent => {
  if (!value || typeof value !== 'object') return false
  const page = value as Partial<LandingPageContent>

  return (
    typeof page.slug === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug) &&
    (page.kind === 'service' || page.kind === 'industry') &&
    typeof page.name === 'string' &&
    typeof page.eyebrow === 'string' &&
    typeof page.headline === 'string' &&
    typeof page.description === 'string' &&
    typeof page.challenge === 'string' &&
    typeof page.approach === 'string' &&
    isStringArray(page.capabilities) &&
    isStringArray(page.outcomes) &&
    isStringArray(page.keywords) &&
    isFaqArray(page.faqs)
  )
}

const unpackModule = (landingModule: LandingModule): LandingPageContent[] => {
  const value = landingModule.default
  const candidates = Array.isArray(value) ? value : [value]
  return candidates.filter(isLandingPage)
}

export const landingPages = Object.values(landingModules)
  .flatMap(unpackModule)
  .sort((left, right) => left.name.localeCompare(right.name))

export const servicePages = landingPages.filter((page) => page.kind === 'service')
export const industryPages = landingPages.filter((page) => page.kind === 'industry')

export const findLandingPage = (kind: LandingKind, slug: string) =>
  landingPages.find((page) => page.kind === kind && page.slug === slug)

export const landingPath = (page: Pick<LandingPageContent, 'kind' | 'slug'>) =>
  `/${page.kind === 'service' ? 'services' : 'industries'}/${page.slug}`
