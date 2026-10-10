import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description: string
  path?: string
  image?: string
  robots?: string
}

const DEFAULT_SITE_URL = 'https://codestra.co'

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, '')

const getSiteUrl = () => normalizeBaseUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL)

const toAbsoluteUrl = (value: string, siteUrl: string) => {
  if (/^https?:\/\//i.test(value)) return value
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`
}

const upsertMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

const upsertCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = href
}

const PageMeta = ({
  title,
  description,
  path = '/',
  image = '/og-cover.png',
  robots = 'index, follow, max-image-preview:large',
}: PageMetaProps) => {
  useEffect(() => {
    const siteUrl = getSiteUrl()
    const canonicalUrl = toAbsoluteUrl(path, siteUrl)
    const imageUrl = toAbsoluteUrl(image, siteUrl)

    document.title = title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertMeta('meta[name="robots"]', 'name', 'robots', robots)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Codestra')
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl)
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl)
    upsertCanonical(canonicalUrl)
  }, [description, image, path, robots, title])

  return null
}

export default PageMeta
