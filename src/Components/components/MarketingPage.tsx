import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

type Highlight = { title: string; description: string }

interface MarketingPageProps {
  eyebrow: string
  title: string
  accent: string
  description: string
  highlights: Highlight[]
  outcomeTitle: string
  outcomes: string[]
}

const MarketingPage = ({ eyebrow, title, accent, description, highlights, outcomeTitle, outcomes }: MarketingPageProps) => (
  <>
    <section className="page-hero section-pad">
      <div className="page-wrap narrow-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title} <em>{accent}</em></h1>
        <p className="hero-copy">{description}</p>
        <div className="button-row">
          <Link className="button button-primary" to="/contact/sales">Talk to our team <ArrowRight size={17} /></Link>
          <Link className="button button-secondary" to="/case-studies">See our work <ArrowRight size={17} /></Link>
        </div>
      </div>
    </section>

    <section className="section-pad section-border">
      <div className="page-wrap">
        <div className="section-heading">
          <p className="eyebrow">How we help</p>
          <h2>Clarity first. Then momentum.</h2>
        </div>
        <div className="feature-grid">
          {highlights.map((item, index) => (
            <article className="feature" key={item.title}>
              <span className="feature-index">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section-pad section-light">
      <div className="page-wrap outcome-layout">
        <div>
          <p className="eyebrow">What good looks like</p>
          <h2>{outcomeTitle}</h2>
        </div>
        <ul className="check-list">
          {outcomes.map((outcome) => <li key={outcome}><Check size={18} />{outcome}</li>)}
        </ul>
      </div>
    </section>

    <section className="cta-band">
      <div className="page-wrap cta-band-inner">
        <div><p className="eyebrow">Ready when you are</p><h2>Let’s build what moves you forward.</h2></div>
        <Link className="button button-primary" to="/contact">Start a conversation <ArrowRight size={17} /></Link>
      </div>
    </section>
  </>
)

export default MarketingPage
