import serviceSpecs from './service-specs.json'
import industrySpecs from './industry-specs.json'
import { buildLandingPages } from './landingPageBuilder.js'

export type LandingPageKind = 'service' | 'industry'

export interface LandingCapability { title: string; description: string }
export interface LandingStep { title: string; description: string }
export interface LandingFaq { question: string; answer: string }

export interface LandingPageContent {
  kind: LandingPageKind
  slug: string
  name: string
  eyebrow: string
  seoTitle: string
  description: string
  headline: string
  intro: string
  challenge: string
  primaryKeyword: string
  keywords: string[]
  outcomes: string[]
  capabilities: LandingCapability[]
  approach: LandingStep[]
  faq: LandingFaq[]
  related: string[]
}

export const landingPages = buildLandingPages(serviceSpecs, industrySpecs) as LandingPageContent[]
export const pagesByKind = (kind: LandingPageKind) => landingPages.filter((page) => page.kind === kind)
export const findLandingPage = (kind: LandingPageKind, slug: string) =>
  landingPages.find((page) => page.kind === kind && page.slug === slug)
