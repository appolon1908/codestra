import { ArrowRight, Bot, Building2, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import MarketingLayout from '../../Components/Layouts/MarketingLayout'
import Seo from '../../Components/seo/Seo'
import {
  industryPages,
  landingPath,
  type LandingKind,
  servicePages,
} from '../../content/landingCatalog'

interface LandingIndexProps {
  kind: LandingKind
}

const LandingIndex = ({ kind }: LandingIndexProps) => {
  const isService = kind === 'service'
  const pages = isService ? servicePages : industryPages
  const Icon = isService ? Bot : Building2
  const path = isService ? '/services' : '/industries'
  const title = isService ? 'AI, Automation & Software Development Services' : 'AI Solutions by Industry'
  const description = isService
    ? 'Explore Codestra services for AI development, automation, web applications, APIs, data systems, and enterprise integration.'
    : 'Explore practical AI, automation, and software solutions designed around the workflows of leading industries.'

  return (
    <MarketingLayout>
      <Seo
        title={title}
        description={description}
        path={path}
        keywords={isService
          ? ['AI development services', 'AI automation company', 'custom software development', 'AI integration services']
          : ['AI solutions by industry', 'industry automation', 'enterprise AI use cases', 'AI transformation company']}
      />

      <section className="page-hero shell">
        <div className="eyebrow"><Sparkles size={15} /> {isService ? 'Capabilities' : 'Industry playbooks'}</div>
        <h1>{isService ? 'Build the system the work actually needs.' : 'Apply AI where industry knowledge matters.'}</h1>
        <p>{description}</p>
        <Link className="button button--primary" to="/consultation">
          Plan a project <ArrowRight size={18} />
        </Link>
      </section>

      <section className="section shell">
        {pages.length > 0 ? (
          <div className="landing-index-grid">
            {pages.map((page, index) => (
              <Link className="landing-index-card" key={page.slug} to={landingPath(page)}>
                <div className="landing-index-card__top">
                  <span className="capability-card__icon"><Icon size={20} /></span>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h2>{page.name}</h2>
                <p>{page.description}</p>
                <span className="text-link">Explore {page.name.toLowerCase()} <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="content-placeholder">
            <Icon size={28} aria-hidden="true" />
            <h2>{isService ? 'Focused capabilities are being published.' : 'Industry playbooks are being published.'}</h2>
            <p>The content expansion is intentionally isolated in its own review branch. The core website remains usable while that catalog is reviewed.</p>
            <Link className="button button--ghost" to="/contact/sales">Talk with Codestra</Link>
          </div>
        )}
      </section>
    </MarketingLayout>
  )
}

export default LandingIndex
