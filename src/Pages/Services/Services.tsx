import { ArrowRight, Bot, Braces, Database, GitBranch, Workflow } from 'lucide-react'
import { Link } from 'react-router'
import Footer from '@/Components/Layouts/Footer'
import Navbar from '@/Components/Layouts/Navbar'

const capabilities = [
  {
    title: 'AI product engineering',
    description: 'Design and ship copilots, agents, retrieval systems and intelligent product features with measurable operating controls.',
    icon: Bot,
  },
  {
    title: 'Workflow automation',
    description: 'Connect people, systems and approvals so repetitive work moves through reliable, observable automations.',
    icon: Workflow,
  },
  {
    title: 'Custom software',
    description: 'Build responsive web applications, portals and mobile experiences around real business processes.',
    icon: Braces,
  },
  {
    title: 'Data and analytics',
    description: 'Create governed data pipelines, decision-ready reporting and the foundations required for dependable AI.',
    icon: Database,
  },
  {
    title: 'API and platform integration',
    description: 'Join Odoo, n8n, Kong, Caddy and specialized providers through secure, versioned integration contracts.',
    icon: GitBranch,
  },
]

const deliverySteps = [
  'Choose one high-value workflow and define the business outcome.',
  'Map data, users, risks, integrations and approval boundaries.',
  'Build a reviewable release with tests, observability and rollback controls.',
  'Launch through staged validation, then improve from production evidence.',
]

const Services = () => (
  <div className="min-h-screen bg-[#080808] text-white">
    <Navbar />
    <main id="main-content">
      <section className="shell pb-24 pt-44 lg:pb-32 lg:pt-52" aria-labelledby="services-heading">
        <p className="eyebrow">AI · automation · software engineering</p>
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
          <div>
            <h1 id="services-heading" className="max-w-5xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Build the system behind your next stage of growth.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-300 sm:text-xl">
              Codestra combines AI engineering, business automation, modern software development and secure integrations to turn fragmented work into reliable digital operations.
            </p>
          </div>
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-7 sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FFD700]">Start with a practical target</p>
            <p className="mt-4 text-lg leading-8 text-neutral-200">
              Bring us the workflow that is slow, manual or difficult to scale. We will help define the smallest production-worthy system that can improve it.
            </p>
            <Link className="button button--gold mt-7" to="/contact/sales">
              Plan your project <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-900 bg-neutral-950/60 py-24 lg:py-32" aria-labelledby="capabilities-heading">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow">Core capabilities</p>
            <h2 id="capabilities-heading" className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              One engineering partner across the complete operating stack.
            </h2>
            <p className="mt-6 text-lg leading-8 text-neutral-300">
              Strategy, interfaces, APIs, data, automation and deployment are designed together so the final system works as one product instead of a collection of disconnected tools.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-[1.75rem] border border-neutral-800 bg-[#101011] p-7 sm:p-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFD700] text-black" aria-hidden="true">
                  <Icon size={23} />
                </span>
                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
                <p className="mt-4 leading-7 text-neutral-300">{description}</p>
              </article>
            ))}

            <article className="rounded-[1.75rem] border border-[#FFD700]/40 bg-[#FFD700] p-7 text-black sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-[#FFD700]" aria-hidden="true">
                <ArrowRight size={23} />
              </span>
              <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">Solutions by industry</h3>
              <p className="mt-4 leading-7 text-neutral-900">Explore common AI and automation opportunities across high-demand industries and operating models.</p>
              <Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-5 py-3 font-bold text-white" to="/industries">
                View industries <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="shell py-24 lg:py-32" aria-labelledby="delivery-heading">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:gap-24">
          <div>
            <p className="eyebrow">Production-minded delivery</p>
            <h2 id="delivery-heading" className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Move from opportunity to a controlled release.
            </h2>
            <p className="mt-6 text-lg leading-8 text-neutral-300">
              Every engagement is shaped around maintainability, security, measurable outcomes and a deployment path your team can understand.
            </p>
          </div>

          <ol className="grid gap-4" aria-label="Codestra delivery process">
            {deliverySteps.map((step, index) => (
              <li key={step} className="grid gap-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:grid-cols-[54px_1fr] sm:items-center sm:p-7">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#FFD700]/50 text-sm font-black text-[#FFD700]" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-lg leading-8 text-neutral-200">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell pb-24 lg:pb-32" aria-labelledby="services-cta-heading">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-8 sm:p-12 lg:p-16">
          <p className="eyebrow">Make the next workflow work better</p>
          <h2 id="services-cta-heading" className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Tell us what is slowing the business down.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            We will help translate the problem into a clear AI, automation or software implementation path.
          </p>
          <Link className="button button--gold mt-8" to="/contact/sales">
            Talk to an expert <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default Services
