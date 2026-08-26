import {
  ArrowRight,
  Bot,
  Braces,
  DatabaseZap,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { Link } from 'react-router'
import Footer from '../../Components/Layouts/Footer'
import Navbar from '../../Components/Layouts/Navbar'

const services = [
  {
    icon: Bot,
    title: 'AI systems that do useful work',
    to: '/ai-services/ai-agent-development',
    description: 'Agents, copilots, retrieval systems and intelligent workflows designed around your data, approvals and operating rules.',
  },
  {
    icon: Workflow,
    title: 'Automation across the business',
    to: '/ai-services/ai-workflow-automation',
    description: 'Connect sales, support, operations and finance so information moves once, decisions happen faster and handoffs stay visible.',
  },
  {
    icon: Braces,
    title: 'Software built around your advantage',
    to: '/ai-services/custom-software-development',
    description: 'Modern web, mobile and API products engineered for the way your company actually competes—not a generic template.',
  },
  {
    icon: Network,
    title: 'Integration without the fragile glue',
    to: '/ai-services/api-development-integration',
    description: 'Secure API gateways, CRM connections, event-driven services and middleware that keep core systems isolated and dependable.',
  },
]

const principles = [
  { icon: LockKeyhole, title: 'Secure by design', text: 'Private services, bounded inputs, least privilege and auditable system boundaries.' },
  { icon: Layers3, title: 'Built in reviewable layers', text: 'Clear branches, contracts, tests and rollout gates instead of one risky release.' },
  { icon: Gauge, title: 'Performance is a feature', text: 'Lean interfaces, purposeful motion and measurable budgets for fast experiences.' },
  { icon: DatabaseZap, title: 'Data stays operational', text: 'Structured events, reliable delivery and CRM-ready context—not disconnected demos.' },
]

const industries = [
  { label: 'Healthcare', to: '/industries/healthcare' },
  { label: 'Financial services', to: '/industries/financial-services' },
  { label: 'Logistics', to: '/industries/logistics-transportation' },
  { label: 'Insurance', to: '/industries/insurance' },
  { label: 'Real estate', to: '/industries/real-estate' },
  { label: 'Retail', to: '/industries/retail-ecommerce' },
  { label: 'Manufacturing', to: '/industries/manufacturing' },
  { label: 'Education', to: '/industries/education' },
  { label: 'Telecommunications', to: '/industries/telecommunications' },
  { label: 'Professional services', to: '/industries/professional-services' },
  { label: 'Hospitality', to: '/industries/hospitality-travel' },
  { label: 'Call centers', to: '/industries/call-centers-bpo' },
]

const Home = () => (
  <>
    <Navbar />
    <main id="main-content" className="home-page">
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow"><Sparkles size={15} aria-hidden="true" /> AI that connects to the real business</p>
          <h1 id="hero-title">Build the AI operating layer your business has been missing.</h1>
          <p className="hero__lede">
            Codestra combines AI development, automation, custom software and secure integration to turn fragmented work into one dependable system.
          </p>
          <div className="hero__actions">
            <Link className="button button--gold" to="/contact/sales">
              Plan your first workflow <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button button--ghost" to="/ai-services">Explore capabilities</Link>
          </div>
          <p className="hero__proof">Designed for Odoo, Kong, Caddy, n8n, modern APIs and the systems you already depend on.</p>
        </div>

        <div className="system-visual" aria-label="Illustration of a secure AI and automation architecture">
          <div className="system-visual__glow" aria-hidden="true" />
          <div className="system-node system-node--input">
            <span>Customer & team</span>
            <strong>Web · Voice · Email · CRM</strong>
          </div>
          <div className="system-connector" aria-hidden="true"><span /></div>
          <div className="system-node system-node--core">
            <span>Codestra intelligence layer</span>
            <strong>AI · Rules · Workflow · APIs</strong>
            <div className="system-pulse" aria-hidden="true" />
          </div>
          <div className="system-connector" aria-hidden="true"><span /></div>
          <div className="system-visual__outcomes">
            <div><small>01</small><strong>Odoo CRM</strong><span>qualified context</span></div>
            <div><small>02</small><strong>Automation</strong><span>reliable actions</span></div>
            <div><small>03</small><strong>Operations</strong><span>clear ownership</span></div>
          </div>
        </div>
      </section>

      <section className="home-section shell" aria-labelledby="services-title">
        <div className="section-heading">
          <div><p className="eyebrow">From idea to production</p><h2 id="services-title">One engineering partner for the whole intelligent system.</h2></div>
          <p>Strategy matters, but execution has to survive real users, real data and real operational pressure. We design the complete path.</p>
        </div>
        <div className="service-grid">
          {services.map(({ icon: Icon, title, description, to }, index) => (
            <article className="service-card" key={title}>
              <div className="service-card__top"><span>0{index + 1}</span><Icon aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link to={to}>See how it works <ArrowRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--surface">
        <div className="shell">
          <div className="section-heading section-heading--center">
            <div><p className="eyebrow">Production-minded by default</p><h2>Modern on the surface. Disciplined underneath.</h2></div>
            <p>A beautiful product is only valuable when the architecture, security, data flow and operating model support it.</p>
          </div>
          <div className="principle-grid">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section shell split-section" aria-labelledby="process-title">
        <div className="split-section__copy">
          <p className="eyebrow">A clearer way to build</p>
          <h2 id="process-title">Start with one expensive problem. Prove the system. Scale what works.</h2>
          <p>We focus the first release on a measurable workflow, connect it safely to the systems of record and create the foundation for the next automation.</p>
          <Link className="text-link" to="/contact/sales">Discuss the best first use case <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <ol className="process-list">
          <li><span>01</span><div><h3>Map the decision and the handoffs</h3><p>Define users, data, exceptions, approvals and the business result before choosing the technology.</p></div></li>
          <li><span>02</span><div><h3>Build the narrow production path</h3><p>Deliver the interface, API, automation and CRM outcome as one testable vertical slice.</p></div></li>
          <li><span>03</span><div><h3>Measure, harden and expand</h3><p>Use real usage, quality and operational signals to decide what earns the next investment.</p></div></li>
        </ol>
      </section>

      <section className="home-section shell" aria-labelledby="industries-title">
        <div className="section-heading">
          <div><p className="eyebrow">Where automation creates leverage</p><h2 id="industries-title">Built for industries with complex work and valuable customer moments.</h2></div>
          <p>We adapt the architecture to your terminology, controls, integrations and service model instead of forcing the same workflow everywhere.</p>
        </div>
        <div className="industry-cloud">
          {industries.map((industry) => <Link key={industry.to} to={industry.to}>{industry.label}</Link>)}
        </div>
        <div className="section-action"><Link className="button button--ghost" to="/industries">Explore all industries <ArrowRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section className="home-section shell final-cta" aria-labelledby="final-cta-title">
        <p className="eyebrow">The next release can be the one that changes the operating model</p>
        <h2 id="final-cta-title">Bring us the workflow everyone complains about.</h2>
        <p>We will help turn it into a secure, measurable AI and automation roadmap—with the first production step clearly defined.</p>
        <Link className="button button--gold" to="/contact/sales">Start the conversation <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
    </main>
    <Footer />
  </>
)

export default Home
