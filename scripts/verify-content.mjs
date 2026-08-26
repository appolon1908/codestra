import { loadLandingPages } from './lib/load-landing-pages.mjs'

const pages = await loadLandingPages()
const services = pages.filter((page) => page.kind === 'service')
const industries = pages.filter((page) => page.kind === 'industry')
const fail = (message) => { throw new Error(`Landing content validation failed: ${message}`) }
const unique = (values) => new Set(values).size === values.length

if (services.length !== 30) fail(`expected 30 services, found ${services.length}`)
if (industries.length !== 25) fail(`expected 25 industries, found ${industries.length}`)
if (!unique(pages.map((page) => `${page.kind}:${page.slug}`))) fail('duplicate kind/slug')
if (!unique(pages.map((page) => page.seoTitle))) fail('duplicate SEO titles')
if (!unique(pages.map((page) => page.description))) fail('duplicate meta descriptions')

for (const page of pages) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) fail(`invalid slug: ${page.slug}`)
  if (page.seoTitle.length > 68) fail(`SEO title too long: ${page.seoTitle}`)
  if (page.description.length < 105 || page.description.length > 180) fail(`description length ${page.description.length} for ${page.slug}`)
  if (page.capabilities.length !== 4) fail(`expected four capabilities for ${page.slug}`)
  if (page.outcomes.length !== 3 || page.approach.length !== 3 || page.faq.length !== 3) fail(`incomplete sections for ${page.slug}`)
  if (page.related.length !== 3) fail(`expected three related links for ${page.slug}`)
  if (page.keywords.length < 4) fail(`insufficient keyword themes for ${page.slug}`)
}

console.log(`Landing content: PASS (${services.length} services, ${industries.length} industries)`)
