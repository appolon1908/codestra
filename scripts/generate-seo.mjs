import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const distDirectory = path.join(root, 'dist')
const contentDirectory = path.join(root, 'src', 'content', 'landing')
const siteUrl = (process.env.SITE_URL || 'https://codestra.co').replace(/\/$/, '')

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const loadLandingPages = async () => {
  const files = (await readdir(contentDirectory)).filter((file) => file.endsWith('.json'))
  const records = []

  for (const file of files) {
    const parsed = JSON.parse(await readFile(path.join(contentDirectory, file), 'utf8'))
    records.push(...(Array.isArray(parsed) ? parsed : [parsed]))
  }

  return records.filter((record) =>
    record &&
    typeof record.slug === 'string' &&
    (record.kind === 'service' || record.kind === 'industry') &&
    typeof record.name === 'string' &&
    typeof record.description === 'string'
  )
}

const landingPages = await loadLandingPages()
const services = landingPages.filter((page) => page.kind === 'service')
const industries = landingPages.filter((page) => page.kind === 'industry')
const template = await readFile(path.join(distDirectory, 'index.html'), 'utf8')

const canonicalFor = (routePath) => `${siteUrl}${routePath === '/' ? '/' : routePath}`

const staticStyle = `
<style id="codestra-static-fallback">
  .static-seo{min-height:100vh;padding:10rem max(1rem,calc((100vw - 1120px)/2)) 5rem;background:#070707;color:#f5f5f7;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .static-seo__eyebrow{color:#f5d64e;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
  .static-seo h1{max-width:14ch;margin:1.2rem 0;font-size:clamp(3rem,8vw,6.5rem);line-height:.95;letter-spacing:-.06em}
  .static-seo>p{max-width:760px;color:#aaaab0;font-size:1.1rem;line-height:1.75}
  .static-seo__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem;margin-top:3rem}
  .static-seo__grid a,.static-seo__card{display:block;border:1px solid #292929;border-radius:1rem;padding:1.2rem;background:#111;color:#f5f5f7;text-decoration:none}
  .static-seo__grid h2,.static-seo__grid h3{margin:.2rem 0 .7rem;font-size:1.2rem}.static-seo__grid p{margin:0;color:#999;line-height:1.55}
  .static-seo__section{margin-top:4rem}.static-seo__section h2{font-size:2rem}.static-seo__section li{margin:.65rem 0;color:#c9c9ce}
</style>`

const renderIndex = (kind, pages) => {
  const noun = kind === 'service' ? 'AI, automation, and software-development services' : 'industry AI and automation playbooks'
  const links = pages.map((page) => {
    const route = `/${kind === 'service' ? 'services' : 'industries'}/${page.slug}`
    return `<a href="${route}"><h2>${escapeHtml(page.name)}</h2><p>${escapeHtml(page.description)}</p></a>`
  }).join('')

  return `<main class="static-seo"><span class="static-seo__eyebrow">Codestra ${kind === 'service' ? 'capabilities' : 'industries'}</span><h1>Explore ${escapeHtml(noun)}.</h1><p>Discover production-minded systems designed around measurable work, governed data, and secure integration.</p><div class="static-seo__grid">${links || '<div class="static-seo__card"><h2>Catalog in review</h2><p>Focused pages are published from the dedicated SEO content branch.</p></div>'}</div></main>`
}

const renderLanding = (page) => {
  const capabilities = (page.capabilities || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const outcomes = (page.outcomes || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const faqs = (page.faqs || []).map((faq) => `<div class="static-seo__card"><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></div>`).join('')

  return `<main class="static-seo"><span class="static-seo__eyebrow">${escapeHtml(page.eyebrow)}</span><h1>${escapeHtml(page.headline)}</h1><p>${escapeHtml(page.description)}</p><section class="static-seo__section"><h2>The challenge</h2><p>${escapeHtml(page.challenge)}</p></section><section class="static-seo__section"><h2>The Codestra approach</h2><p>${escapeHtml(page.approach)}</p></section><section class="static-seo__section"><h2>Capabilities</h2><ul>${capabilities}</ul></section><section class="static-seo__section"><h2>Target outcomes</h2><ul>${outcomes}</ul></section><section class="static-seo__section"><h2>Frequently asked questions</h2><div class="static-seo__grid">${faqs}</div></section></main>`
}

const replaceMeta = (html, { title, description, canonical, keywords = [], body, schema }) => {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeCanonical = escapeHtml(canonical)
  const safeKeywords = escapeHtml(keywords.join(', '))
  const schemaJson = JSON.stringify(schema).replaceAll('<', '\\u003c')

  return html
    .replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${safeDescription}" />`)
    .replace(/<meta name="keywords" content="[^"]*"\s*\/>/, `<meta name="keywords" content="${safeKeywords}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${safeDescription}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${safeCanonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${safeDescription}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${safeCanonical}" />`)
    .replace('</head>', `${staticStyle}<script type="application/ld+json">${schemaJson}</script></head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

const writeRoute = async (routePath, html) => {
  const relativePath = routePath.replace(/^\//, '')
  const outputDirectory = relativePath ? path.join(distDirectory, relativePath) : distDirectory
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(path.join(outputDirectory, 'index.html'), html)
}

const indexRoutes = [
  {
    path: '/services',
    title: 'AI, Automation & Software Development Services | Codestra',
    description: 'Explore Codestra services for AI development, automation, web applications, APIs, data systems, and enterprise integration.',
    keywords: ['AI development services', 'business automation', 'custom software development'],
    body: renderIndex('service', services),
  },
  {
    path: '/industries',
    title: 'AI Solutions by Industry | Codestra',
    description: 'Explore practical AI, automation, and software solutions designed around the workflows of leading industries.',
    keywords: ['AI solutions by industry', 'industry automation', 'enterprise AI'],
    body: renderIndex('industry', industries),
  },
]

for (const route of indexRoutes) {
  const canonical = canonicalFor(route.path)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: route.title.replace(' | Codestra', ''),
    description: route.description,
    url: canonical,
  }
  await writeRoute(route.path, replaceMeta(template, { ...route, canonical, schema }))
}

for (const page of landingPages) {
  const routePath = `/${page.kind === 'service' ? 'services' : 'industries'}/${page.slug}`
  const canonical = canonicalFor(routePath)
  const title = `${page.headline} | Codestra`
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': page.kind === 'service' ? 'Service' : 'WebPage',
      name: page.name,
      description: page.description,
      url: canonical,
      provider: { '@type': 'Organization', name: 'Codestra', url: siteUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (page.faqs || []).map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ]

  await writeRoute(routePath, replaceMeta(template, {
    title,
    description: page.description,
    canonical,
    keywords: page.keywords || [],
    body: renderLanding(page),
    schema,
  }))
}

const sitemapPaths = [
  '/',
  '/services',
  '/industries',
  '/about',
  '/case-studies',
  '/contact',
  '/consultation',
  '/privacy',
  ...landingPages.map((page) => `/${page.kind === 'service' ? 'services' : 'industries'}/${page.slug}`),
]

const lastModified = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((routePath) => `  <url><loc>${escapeHtml(canonicalFor(routePath))}</loc><lastmod>${lastModified}</lastmod></url>`).join('\n')}\n</urlset>\n`

await writeFile(path.join(distDirectory, 'sitemap.xml'), sitemap)
await writeFile(path.join(distDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /auth/\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
await writeFile(path.join(distDirectory, 'seo-manifest.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  siteUrl,
  servicePages: services.length,
  industryPages: industries.length,
  routes: sitemapPaths,
}, null, 2))

console.log(`Generated ${landingPages.length + indexRoutes.length} crawlable route documents and ${sitemapPaths.length} sitemap entries.`)
