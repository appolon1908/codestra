import { ArrowRight, Check, ChevronRight, Cpu, Factory, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router'
import Footer from '../../Components/Layouts/Footer'
import Navbar from '../../Components/Layouts/Navbar'
import PageMeta from '../../Components/SEO/PageMeta'
import NotFound from '../NotFound'
import { findLandingPage, landingPages, type LandingPageKind } from '../../content/landingPages'

interface LandingPageProps {
  kind: LandingPageKind
}

const LandingPage = ({ kind }: LandingPageProps) => {
  const { slug = '' } = useParams()
  const page = findLandingPage(kind, slug)

  if (!page) return <NotFound />

  const basePath = kind === 'service' ? '/ai-services' : '/industries'
  const relatedPages = page.related
    .map((relatedSlug) => landingPages.find((candidate) => candidate.kind === kind && candidate.slug === relatedSlug))
    .filter((candidate) => candidate !== undefined)

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.description} path={`${basePath}/${page.slug}`} />
      <Navbar />
      <main id="main-content" className="landing-page">
        <article itemScope itemType={kind === 'service' ? 'https://schema.org/Service' : 'https://schema.org/WebPage'}>
          <meta itemProp="name" content={page.name} />
          <meta itemProp="description" content={page.description} />

          <header className="landing-hero shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
              <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link itemProp="item" to="/"><span itemProp="name">Home</span></Link>
                <meta itemProp="position" content="1" />
              </span>
              <ChevronRight size={14} aria-hidden="true" />
              <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link itemProp="item" to={basePath}><span itemProp="name">{kind === 'service' ? 'AI services' : 'Industries'}</span></Link>
                <meta itemProp="position" content="2" />
              </span>
              <ChevronRight size={14} aria-hidden="true" />
              <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span itemProp="name">{page.name}</span>
                <meta itemProp="position" content="3" />
              </span>
            </nav>

            <div className="landing-hero__grid">
              <div>
                <p className="eyebrow">{page.eyebrow}</p>
                <h1 itemProp="headline">{page.headline}</h1>
                <p className="landing-hero__lede" itemProp="abstract">{page.intro}</p>
                <div className="hero__actions">
                  <Link className="button button--gold" to="/contact/sales">Plan this workflow <ArrowRight size={18} aria-hidden="true" /></Link>
                  <a className="button button--ghost" href="#capabilities">View capabilities</a>
                </div>
              </div>
              <aside className="landing-signal" aria-label="Codestra delivery principles">
                <div className="landing-signal__icon">{kind === 'service' ? <Cpu aria-hidden="true" /> : <Factory aria-hidden="true" />}</div>
                <p>Production fit</p>
                <strong>Designed around systems, owners, exceptions and measurable outcomes.</strong>
                <div className="landing-signal__line" />
                <p>Control model</p>
                <strong>Private services, explicit permissions and human authority where impact is high.</strong>
              </aside>
            </div>
          </header>

          <section className="landing-section landing-section--surface">
            <div className="shell landing-context">
              <div>
                <p className="eyebrow">Why the integration layer matters</p>
                <h2>The value is in the complete operating path.</h2>
              </div>
              <p>{page.challenge}</p>
            </div>
          </section>

          <section className="landing-section shell" aria-labelledby="outcomes-title">
            <div className="section-heading">
              <div><p className="eyebrow">What the first release should improve</p><h2 id="outcomes-title">Clear outcomes before feature volume.</h2></div>
              <p>Every engagement starts with a production workflow and acceptance evidence—not a collection of disconnected AI experiments.</p>
            </div>
            <div className="outcome-grid">
              {page.outcomes.map((outcome, index) => (
                <article key={outcome}><span>0{index + 1}</span><Check aria-hidden="true" /><p>{outcome}</p></article>
              ))}
            </div>
          </section>

          <section id="capabilities" className="landing-section landing-section--surface">
            <div className="shell">
              <div className="section-heading">
                <div><p className="eyebrow">Capabilities</p><h2>What Codestra can build into the workflow.</h2></div>
                <p>The components are selected to solve the operating problem and fit the current architecture, not to maximize technology count.</p>
              </div>
              <div className="capability-grid">
                {page.capabilities.map((capability, index) => (
                  <article key={capability.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{capability.title}</h3><p>{capability.description}</p></article>
                ))}
              </div>
            </div>
          </section>

          <section className="landing-section shell" aria-labelledby="approach-title">
            <div className="section-heading">
              <div><p className="eyebrow">Delivery approach</p><h2 id="approach-title">A narrow path to production, then evidence-led expansion.</h2></div>
              <p>The first version is structured so technical, security and business reviewers can understand exactly what changes and how it is rolled back.</p>
            </div>
            <ol className="landing-steps">
              {page.approach.map((step, index) => (
                <li key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>
              ))}
            </ol>
          </section>

          <section className="landing-section landing-section--surface">
            <div className="shell landing-trust">
              <ShieldCheck aria-hidden="true" />
              <div><p className="eyebrow">Architecture principle</p><h2>Public experience outside. Private systems inside.</h2></div>
              <p>Browser traffic should terminate at a controlled public edge, pass through authenticated and rate-limited middleware, and reach Odoo, n8n or other internal services only through explicit server-side integrations.</p>
            </div>
          </section>

          <section className="landing-section shell faq-section" aria-labelledby="faq-title" itemScope itemType="https://schema.org/FAQPage">
            <div><p className="eyebrow">Questions</p><h2 id="faq-title">Frequently asked questions.</h2></div>
            <div className="faq-list">
              {page.faq.map((faq) => (
                <details key={faq.question} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <summary itemProp="name">{faq.question}</summary>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"><p itemProp="text">{faq.answer}</p></div>
                </details>
              ))}
            </div>
          </section>

          <section className="landing-section shell related-section" aria-labelledby="related-title">
            <div><p className="eyebrow">Continue exploring</p><h2 id="related-title">Related {kind === 'service' ? 'services' : 'industries'}.</h2></div>
            <div className="related-grid">
              {relatedPages.map((related) => (
                <Link key={related.slug} to={`${basePath}/${related.slug}`}><span>{related.eyebrow}</span><h3>{related.name}</h3><p>{related.description}</p><ArrowRight size={18} aria-hidden="true" /></Link>
              ))}
            </div>
          </section>

          <section className="home-section shell final-cta">
            <p className="eyebrow">Build the first production workflow</p>
            <h2>Make {page.name.toLowerCase()} useful inside the real business.</h2>
            <p>Codestra can help define the system boundary, workflow, integration contract and evidence required for a safe first release.</p>
            <Link className="button button--gold" to="/contact/sales">Talk to an expert <ArrowRight size={18} aria-hidden="true" /></Link>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}

export default LandingPage
