import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const contentDirectory = path.join(root, 'src', 'content', 'landing')
const distDirectory = path.join(root, 'dist')
const planPath = path.join(root, 'config', 'seo-plan.json')

const fail = (message) => {
  console.error(`SEO_CHECK_FAILED: ${message}`)
  process.exitCode = 1
}

const loadJsonRecords = async () => {
  const files = (await readdir(contentDirectory)).filter((file) => file.endsWith('.json'))
  const records = []
  for (const file of files) {
    const parsed = JSON.parse(await readFile(path.join(contentDirectory, file), 'utf8'))
    const values = Array.isArray(parsed) ? parsed : [parsed]
    for (const value of values) records.push({ ...value, sourceFile: file })
  }
  return records
}

const records = await loadJsonRecords()
const slugKeys = new Set()
const titleKeys = new Set()

for (const record of records) {
  const prefix = `${record.sourceFile}:${record.slug || 'missing-slug'}`
  const requiredStrings = ['slug', 'name', 'eyebrow', 'headline', 'description', 'challenge', 'approach']
  for (const field of requiredStrings) {
    if (typeof record[field] !== 'string' || record[field].trim().length < (field === 'description' ? 90 : 3)) {
      fail(`${prefix} has an invalid ${field}`)
    }
  }

  if (!['service', 'industry'].includes(record.kind)) fail(`${prefix} has an invalid kind`)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug || '')) fail(`${prefix} has a non-canonical slug`)
  if (!Array.isArray(record.capabilities) || record.capabilities.length < 4) fail(`${prefix} needs at least four capabilities`)
  if (!Array.isArray(record.outcomes) || record.outcomes.length < 4) fail(`${prefix} needs at least four outcomes`)
  if (!Array.isArray(record.keywords) || record.keywords.length < 6) fail(`${prefix} needs at least six targeted keywords`)
  if (!Array.isArray(record.faqs) || record.faqs.length < 3) fail(`${prefix} needs at least three FAQs`)

  const slugKey = `${record.kind}:${record.slug}`
  if (slugKeys.has(slugKey)) fail(`${prefix} duplicates ${slugKey}`)
  slugKeys.add(slugKey)

  const titleKey = String(record.headline || '').toLowerCase()
  if (titleKeys.has(titleKey)) fail(`${prefix} duplicates a headline`)
  titleKeys.add(titleKey)

  const outputPath = path.join(
    distDirectory,
    record.kind === 'service' ? 'services' : 'industries',
    record.slug,
    'index.html',
  )
  try {
    await access(outputPath)
  } catch {
    fail(`${prefix} is missing generated HTML at ${outputPath}`)
  }
}

let plan
try {
  plan = JSON.parse(await readFile(planPath, 'utf8'))
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') throw error
}

const serviceCount = records.filter((record) => record.kind === 'service').length
const industryCount = records.filter((record) => record.kind === 'industry').length

if (plan) {
  if (serviceCount !== plan.expectedServicePages) fail(`expected ${plan.expectedServicePages} service pages, found ${serviceCount}`)
  if (industryCount !== plan.expectedIndustryPages) fail(`expected ${plan.expectedIndustryPages} industry pages, found ${industryCount}`)
}

const sitemap = await readFile(path.join(distDirectory, 'sitemap.xml'), 'utf8')
for (const record of records) {
  const route = `/${record.kind === 'service' ? 'services' : 'industries'}/${record.slug}`
  if (!sitemap.includes(route)) fail(`sitemap is missing ${route}`)
}

if (!sitemap.includes('/services') || !sitemap.includes('/industries')) fail('sitemap is missing landing indexes')
if (process.exitCode) process.exit(process.exitCode)

console.log(`SEO checks passed: ${serviceCount} service pages, ${industryCount} industry pages, unique metadata, generated HTML, and sitemap coverage.`)
