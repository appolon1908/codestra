import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadLandingPages } from './lib/load-landing-pages.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(projectRoot, 'dist')
const pages = await loadLandingPages(projectRoot)
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://codestra.co').replace(/\/$/, '')

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;')

const setMeta = (html, attribute, key, value) => {
  const escaped = escapeHtml(value)
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i')
  const tag = `<meta ${attribute}="${key}" content="${escaped}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

const renderFallback = (page, basePath) => {
  const canonical = `${siteUrl}${basePath}/${page.slug}`
  const capabilities = page.capabilities.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></li>`).join('')
  const outcomes = page.outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const faqs = page.faq.map((item) => `<section itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><h3 itemprop="name">${escapeHtml(item.question)}</h3><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">${escapeHtml(item.answer)}</p></div></section>`).join('')
  return `<main id="main-content" class="seo-static-shell" itemscope itemtype="${page.kind === 'service' ? 'https://schema.org/Service' : 'https://schema.org/WebPage'}">
    <nav aria-label="Breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList"><a href="${siteUrl}/">Codestra</a><span>›</span><a href="${siteUrl}${basePath}">${page.kind === 'service' ? 'AI services' : 'Industries'}</a><span>›</span><span>${escapeHtml(page.name)}</span></nav>
    <p>${escapeHtml(page.eyebrow)}</p><h1 itemprop="name">${escapeHtml(page.headline)}</h1><p itemprop="description">${escapeHtml(page.intro)}</p>
    <p><a href="${siteUrl}/contact/sales">Plan this workflow with Codestra</a></p>
    <section><h2>Why the complete workflow matters</h2><p>${escapeHtml(page.challenge)}</p></section>
    <section><h2>Expected outcomes</h2><ul>${outcomes}</ul></section>
    <section><h2>Capabilities</h2><ul>${capabilities}</ul></section>
    <section itemscope itemtype="https://schema.org/FAQPage"><h2>Frequently asked questions</h2>${faqs}</section>
    <p><a href="${canonical}">Open the interactive Codestra page</a></p>
  </main>`
}

const renderPage = (page) => {
  const basePath = page.kind === 'service' ? '/ai-services' : '/industries'
  const route = `${basePath}/${page.slug}`
  const canonical = `${siteUrl}${route}`
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.seoTitle)}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${renderFallback(page, basePath)}</div>`)

  html = setMeta(html, 'name', 'description', page.description)
  html = setMeta(html, 'property', 'og:title', page.seoTitle)
  html = setMeta(html, 'property', 'og:description', page.description)
  html = setMeta(html, 'property', 'og:url', canonical)
  html = setMeta(html, 'name', 'twitter:title', page.seoTitle)
  html = setMeta(html, 'name', 'twitter:description', page.description)
  return { route, html }
}

for (const page of pages) {
  const { route, html } = renderPage(page)
  const targetDir = path.join(distDir, route)
  await mkdir(targetDir, { recursive: true })
  await writeFile(path.join(targetDir, 'index.html'), html)
}

const indexRoutes = [
  { route: 'ai-services', kind: 'service', title: 'AI, Automation and Software Services | Codestra', description: 'Explore 30 Codestra services for AI development, automation, custom software, Odoo, n8n, Kong, Caddy, data and cloud platforms.' },
  { route: 'industries', kind: 'industry', title: 'AI and Automation by Industry | Codestra', description: 'Explore practical Codestra AI, automation and software solutions for 25 industries with workflows shaped around real operating constraints.' },
]

const renderIndexFallback = ({ route, kind, title, description }) => {
  const indexPages = pages.filter((page) => page.kind === kind)
  const links = indexPages.map((page) => `<li><a href="${siteUrl}/${route}/${page.slug}"><strong>${escapeHtml(page.name)}</strong><span>${escapeHtml(page.description)}</span></a></li>`).join('')
  return `<main id="main-content" class="seo-static-shell seo-static-index" data-static-index="${kind}">
    <nav aria-label="Breadcrumb"><a href="${siteUrl}/">Codestra</a><span>›</span><span>${kind === 'service' ? 'AI services' : 'Industries'}</span></nav>
    <p>${kind === 'service' ? 'Codestra capabilities' : 'Industry solutions'}</p><h1>${escapeHtml(title.replace(' | Codestra', ''))}</h1><p>${escapeHtml(description)}</p>
    <ul>${links}</ul><p><a href="${siteUrl}/contact/sales">Plan a production workflow with Codestra</a></p>
  </main>`
}

for (const indexRoute of indexRoutes) {
  const { route, title, description } = indexRoute
  const canonical = `${siteUrl}/${route}`
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${renderIndexFallback(indexRoute)}</div>`)
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', canonical)
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)
  const targetDir = path.join(distDir, route)
  await mkdir(targetDir, { recursive: true })
  await writeFile(path.join(targetDir, 'index.html'), html)
}

const staticRoutes = ['/', '/about', '/ai-services', '/industries', '/case-studies', '/contact', '/contact/sales', '/services', '/privacy', '/electronic-billing']
const dynamicRoutes = pages.map((page) => `${page.kind === 'service' ? '/ai-services' : '/industries'}/${page.slug}`)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticRoutes, ...dynamicRoutes].map((route) => `  <url><loc>${siteUrl}${route === '/' ? '/' : route}</loc></url>`).join('\n')}\n</urlset>\n`
await writeFile(path.join(distDir, 'sitemap.xml'), sitemap)

console.log(`Generated ${pages.length + indexRoutes.length} crawlable route documents and sitemap.xml`)
