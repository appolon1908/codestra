import { ArrowRight, Check, ChevronRight, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router'
import MarketingLayout from '../../Components/Layouts/MarketingLayout'
import Seo from '../../Components/seo/Seo'
import {
  findLandingPage,
  landingPages,
  landingPath,
  type LandingKind,
} from '../../content/landingCatalog'
import NotFound from '../NotFound'

interface LandingPageProps {
  kind: LandingKind
}

const LandingPage = ({ kind }: LandingPageProps) => {
  const { slug = '' } = useParams<{ slug: string }>()
  const page = findLandingPage(kind, slug)

  if (!page) return <NotFound />

  const sectionName = kind === 'service' ? 'Services' : 'Industries'
  const sectionPath = kind === 'service' ? '/services' : '/industries'
  const related = landingPages
    .filter((candidate) => candidate.kind === kind && candidate.slug !== page.slug)
    .slice(0, 3)
  const consultationPath = `/consultation?${new URLSearchParams({
    service: kind === 'service' ? page.slug : '',
    industry: kind === 'industry' ? page.slug : '',
  }).toString()}`

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': kind === 'service' ? 'Service' : 'WebPage',
      name: page.name,
      description: page.description,
      url: `https://codestra.co${landingPath(page)}`,
      provider: { '@type': 'Organization', name: 'Codestra', url: 'https://codestra.co' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://codestra.co/' },
        { '@type': 'ListItem', position: 2, name: sectionName, item: `https://codestra.co${sectionPath}` },
        { '@type': 'ListItem', position: 3, name: page.name, item: `https://codestra.co${landingPath(page)}` },
      ],
    },
  ]

  return (
    <MarketingLayout>
      <Seo
        title={page.headline}
        description={page.description}
        path={landingPath(page)}
        keywords={page.keywords}
        schema={schema}
      />

      <section className="landing-hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={14} />
          <Link to={sectionPath}>{sectionName}</Link><ChevronRight size={14} />
          <span aria-current="page">{page.name}</span>
        </nav>
        <div className="landing-hero__grid">
          <div>
            <div className="eyebrow"><Sparkles size={15} /> {page.eyebrow}</div>
            <h1>{page.headline}</h1>
            <p>{page.description}</p>
            <div className="hero__actions">
              <Link className="button button--primary" to={consultationPath}>Plan this system <ArrowRight size={18} /></Link>
              <Link className="button button--ghost" to="/case-studies">See selected work</Link>
            </div>
          </div>
          <aside className="landing-hero__summary">
            <span>Designed for production</span>
            <h2>{page.name}</h2>
            <ul>
              {page.outcomes.slice(0, 4).map((outcome) => <li key={outcome}><Check size={16} /> {outcome}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section shell landing-story">
        <article>
          <span className="section-kicker">The challenge</span>
          <h2>Where the work breaks down.</h2>
          <p>{page.challenge}</p>
        </article>
        <article>
          <span className="section-kicker">The Codestra approach</span>
          <h2>Connect intelligence to execution.</h2>
          <p>{page.approach}</p>
        </article>
      </section>

      <section className="section section--tint">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div><span className="section-kicker">Core capabilities</span><h2>What the solution can include.</h2></div>
            <p>The exact architecture follows your workflow, data boundaries, risk profile, and existing systems.</p>
          </div>
          <div className="capability-list-grid">
            {page.capabilities.map((capability, index) => (
              <article key={capability}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{capability}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading section-heading--split">
          <div><span className="section-kicker">Target outcomes</span><h2>Measure the change in the operation.</h2></div>
          <p>We agree on success signals before implementation so the work can be judged by business evidence, not novelty.</p>
        </div>
        <div className="outcome-grid">
          {page.outcomes.map((outcome) => <div key={outcome}><Check size={18} /><p>{outcome}</p></div>)}
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell faq-layout">
          <div><span className="section-kicker">Frequently asked questions</span><h2>Questions teams ask before they build.</h2></div>
          <div className="faq-list">
            {page.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section shell">
          <div className="section-heading section-heading--split">
            <div><span className="section-kicker">Related {sectionName.toLowerCase()}</span><h2>Continue exploring.</h2></div>
            <Link className="text-link" to={sectionPath}>View all <ArrowRight size={16} /></Link>
          </div>
          <div className="related-grid">
            {related.map((candidate) => (
              <Link key={candidate.slug} to={landingPath(candidate)}>
                <span>{candidate.eyebrow}</span><h3>{candidate.name}</h3><p>{candidate.description}</p><ArrowRight />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section shell final-cta">
        <div><span className="section-kicker">Build the first production path</span><h2>Make {page.name.toLowerCase()} useful in your operation.</h2><p>Bring the workflow, constraints, and systems you already have. We will turn them into an executable plan.</p></div>
        <Link className="button button--primary" to={consultationPath}>Start the conversation <ArrowRight size={18} /></Link>
      </section>
    </MarketingLayout>
  )
}

export default LandingPage
