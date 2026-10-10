import { Check, LockKeyhole, Route, ShieldCheck, Workflow } from 'lucide-react'
import MarketingLayout from '../../Components/Layouts/MarketingLayout'
import Seo from '../../Components/seo/Seo'
import LeadForm from './LeadForm'
import './lead-intake.css'

const Consultation = () => (
  <MarketingLayout className="consultation-page">
    <Seo
      title="Plan an AI, Automation or Software Project"
      description="Tell Codestra about the workflow, product, AI opportunity, or integration you need. Submit a secure project request routed through Caddy and Kong into the Codestra CRM campaign."
      path="/consultation"
      keywords={[
        'AI project consultation',
        'AI development quote',
        'automation consulting meeting',
        'custom software project request',
        'Odoo AI integration consultation',
        'Codestra contact',
      ]}
      schema={{
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Codestra project consultation',
        url: 'https://codestra.co/consultation',
        description: 'Secure project intake for AI, automation, software development, and enterprise integration work.',
      }}
    />

    <section className="consultation-hero shell">
      <div className="consultation-hero__copy">
        <span className="section-kicker">Start with one valuable workflow</span>
        <h1>Let’s turn the bottleneck into a system.</h1>
        <p>Share the problem, the people affected, and the tools already involved. Codestra will prepare a practical first conversation around value, architecture, risk, and the smallest production milestone.</p>
        <div className="consultation-points">
          <div><span><Workflow size={19} /></span><p><strong>Workflow first</strong>We begin with the job and outcome—not a model looking for a use case.</p></div>
          <div><span><Route size={19} /></span><p><strong>Clear integration path</strong>We account for identity, APIs, Odoo, n8n, gateways, data, and operational ownership.</p></div>
          <div><span><ShieldCheck size={19} /></span><p><strong>Production controls</strong>Security, idempotency, evidence, observability, and human authority are part of the plan.</p></div>
        </div>
        <div className="consultation-security">
          <LockKeyhole size={18} />
          <p><strong>Your form does not connect directly to Odoo.</strong> It enters a versioned gateway contract, then a private adapter validates the campaign and CRM mapping.</p>
        </div>
      </div>
      <LeadForm />
    </section>

    <section className="consultation-expect shell">
      <div><span className="section-kicker">What happens next</span><h2>A useful conversation, not a blind sales call.</h2></div>
      <ol>
        <li><span>01</span><p><strong>Review</strong>We read the workflow, service, industry, timing, and existing-system context.</p></li>
        <li><span>02</span><p><strong>Prepare</strong>We identify likely questions, dependencies, risk boundaries, and a possible first milestone.</p></li>
        <li><span>03</span><p><strong>Meet</strong>We confirm fit and leave you with a clearer next decision, whether or not an engagement begins.</p></li>
      </ol>
    </section>

    <section className="consultation-proof shell">
      {['AI and agent systems', 'Odoo and CRM integration', 'Caddy and Kong API boundaries', 'n8n workflow automation'].map((item) => <span key={item}><Check size={15} />{item}</span>)}
    </section>
  </MarketingLayout>
)

export default Consultation
