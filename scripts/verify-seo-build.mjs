import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadLandingPages } from './lib/load-landing-pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const pages = await loadLandingPages(root)
const failures = []
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;')

for (const page of pages) {
  const base = page.kind === 'service' ? 'ai-services' : 'industries'
  const file = path.join(dist, base, page.slug, 'index.html')
  const html = await readFile(file, 'utf8').catch(() => '')
  if (!html) failures.push(`missing ${base}/${page.slug}/index.html`)
  else {
    if (!html.includes(`<title>${escapeHtml(page.seoTitle)}</title>`)) failures.push(`wrong title for ${page.slug}`)
    if (!html.includes(`rel="canonical"`)) failures.push(`missing canonical for ${page.slug}`)
    if (!html.includes('data-prerendered="true"')) failures.push(`missing static fallback for ${page.slug}`)
    if (!html.includes('itemtype="https://schema.org/FAQPage"')) failures.push(`missing FAQ microdata for ${page.slug}`)
  }
}

for (const [route, expectedKind, expectedCount] of [['ai-services', 'service', 30], ['industries', 'industry', 25]]) {
  const html = await readFile(path.join(dist, route, 'index.html'), 'utf8').catch(() => '')
  if (!html.includes('data-prerendered="true"')) failures.push(`missing static index fallback for ${route}`)
  if (!html.includes(`data-static-index="${expectedKind}"`)) failures.push(`wrong static index kind for ${route}`)
  const linkCount = (html.match(new RegExp(`href="https://codestra\\.co/${route}/`, 'g')) || []).length
  if (linkCount < expectedCount) failures.push(`${route} static index exposes only ${linkCount} landing links`)
}

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8').catch(() => '')
if ((sitemap.match(/<url>/g) || []).length < 65) failures.push('sitemap has fewer than 65 URLs')

const assetsDir = path.join(dist, 'assets')
const assetNames = await readdir(assetsDir).catch(() => [])
for (const name of assetNames) {
  const size = (await stat(path.join(assetsDir, name))).size
  if (name.endsWith('.js') && size > 700_000) failures.push(`JavaScript asset exceeds 700 KB: ${name} (${size})`)
  if (name.endsWith('.css') && size > 300_000) failures.push(`CSS asset exceeds 300 KB: ${name} (${size})`)
}

if (failures.length) throw new Error(`SEO build verification failed:\n- ${failures.join('\n- ')}`)
console.log(`SEO build verification: PASS (${pages.length} landing pages)`)
