import { useMemo, useState, type ChangeEvent } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { Link } from 'react-router'
import Footer from '../../Components/Layouts/Footer'
import Navbar from '../../Components/Layouts/Navbar'
import PageMeta from '../../Components/SEO/PageMeta'
import { pagesByKind, type LandingPageKind } from '../../content/landingPages'

interface LandingIndexPageProps {
  kind: LandingPageKind
}

const pageCopy = {
  service: {
    eyebrow: 'Codestra capabilities',
    title: 'AI, automation and software services built for production.',
    description: 'Explore Codestra services for AI development, workflow automation, custom software, Odoo, n8n, Kong, Caddy, data and cloud platforms.',
    search: 'Search services',
  },
  industry: {
    eyebrow: 'Industry solutions',
    title: 'AI and automation shaped around the industry workflow.',
    description: 'Explore practical AI, automation and software solutions for healthcare, finance, logistics, insurance, retail, manufacturing and other industries.',
    search: 'Search industries',
  },
} as const

const LandingIndexPage = ({ kind }: LandingIndexPageProps) => {
  const [query, setQuery] = useState('')
  const copy = pageCopy[kind]
  const basePath = kind === 'service' ? '/ai-services' : '/industries'
  const pages = pagesByKind(kind)
  const visiblePages = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return pages
    return pages.filter((page) => `${page.name} ${page.description} ${page.keywords.join(' ')}`.toLowerCase().includes(normalized))
  }, [pages, query])

  return (
    <>
      <PageMeta title={`${copy.title} | Codestra`} description={copy.description} path={basePath} />
      <Navbar />
      <main id="main-content" className="landing-index">
        <header className="landing-index__hero shell">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <label className="landing-search">
            <span className="sr-only">{copy.search}</span>
            <Search size={18} aria-hidden="true" />
            <input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder={copy.search} type="search" />
          </label>
        </header>

        <section className="landing-index__section shell" aria-live="polite">
          <div className="landing-index__count"><span>{visiblePages.length}</span> {kind === 'service' ? 'services' : 'industries'}</div>
          <div className="landing-index__grid">
            {visiblePages.map((page, index) => (
              <Link key={page.slug} to={`${basePath}/${page.slug}`} className="landing-index__card">
                <div><span>{String(index + 1).padStart(2, '0')}</span><ArrowRight size={18} aria-hidden="true" /></div>
                <h2>{page.name}</h2>
                <p>{page.description}</p>
                <strong>Explore {page.name.toLowerCase()}</strong>
              </Link>
            ))}
          </div>
          {visiblePages.length === 0 && <p className="landing-index__empty">No matches yet. Try a broader term or contact Codestra for a custom workflow.</p>}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default LandingIndexPage
