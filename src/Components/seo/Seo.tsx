import { useEffect } from 'react'

const SITE_URL = 'https://codestra.co'
const DEFAULT_IMAGE = `${SITE_URL}/codestra-social.svg`

interface SeoProps {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article'
  schema?: Record<string, unknown> | Array<Record<string, unknown>>
  noIndex?: boolean
}

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    document.head.appendChild(meta)
  }
  meta.content = content
}

const upsertCanonical = (href: string) => {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = href
}

const organizationSchema: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Codestra',
  url: SITE_URL,
  logo: `${SITE_URL}/smallLogo.png`,
  email: 'support@codestra.co',
  description: 'AI development, business automation, software engineering, and enterprise integration services.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Lope de Vega 13, Progreso Business Center',
    addressLocality: 'Santo Domingo',
    postalCode: '10130',
    addressCountry: 'DO',
  },
}

const Seo = ({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_IMAGE,
  type = 'website',
  schema,
  noIndex = false,
}: SeoProps) => {
  useEffect(() => {
    const canonicalUrl = new URL(path, SITE_URL).toString()
    const resolvedImage = new URL(image, SITE_URL).toString()
    const fullTitle = title.includes('Codestra') ? title : `${title} | Codestra`

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    upsertMeta('name', 'theme-color', '#070707')
    if (keywords.length > 0) upsertMeta('name', 'keywords', keywords.join(', '))

    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:image', resolvedImage)
    upsertMeta('property', 'og:site_name', 'Codestra')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', resolvedImage)
    upsertCanonical(canonicalUrl)

    const schemaNode = document.createElement('script')
    schemaNode.id = 'codestra-route-schema'
    schemaNode.type = 'application/ld+json'
    schemaNode.text = JSON.stringify(schema ? [organizationSchema, ...(Array.isArray(schema) ? schema : [schema])] : organizationSchema)
    document.getElementById(schemaNode.id)?.remove()
    document.head.appendChild(schemaNode)
  }, [description, image, keywords, noIndex, path, schema, title, type])

  return null
}

export default Seo
