import { ArrowRight, Building2, Factory, GraduationCap, HeartPulse, Landmark, Scale, ShoppingCart, Truck } from 'lucide-react'
import { Link } from 'react-router'
import Footer from '@/Components/Layouts/Footer'
import Navbar from '@/Components/Layouts/Navbar'

const industries = [
  {
    name: 'Healthcare',
    description: 'Patient access, scheduling, document processing and governed operational intelligence.',
    icon: HeartPulse,
  },
  {
    name: 'Financial services',
    description: 'Client onboarding, service operations, document workflows and human-reviewed automation.',
    icon: Landmark,
  },
  {
    name: 'Logistics and transportation',
    description: 'Dispatch, tracking, customer communication, document capture and exception management.',
    icon: Truck,
  },
  {
    name: 'Manufacturing',
    description: 'Production visibility, knowledge systems, quality workflows and connected operations.',
    icon: Factory,
  },
  {
    name: 'Legal and professional services',
    description: 'Intake, matter support, document intelligence, research assistance and approval workflows.',
    icon: Scale,
  },
  {
    name: 'Real estate and construction',
    description: 'Lead qualification, project coordination, field reporting and property operations.',
    icon: Building2,
  },
  {
    name: 'Retail and e-commerce',
    description: 'Customer support, merchandising workflows, order operations and business analytics.',
    icon: ShoppingCart,
  },
  {
    name: 'Education',
    description: 'Learner support, enrollment operations, knowledge access and administrative automation.',
    icon: GraduationCap,
  },
]

const principles = [
  'Begin with the workflow, operating constraints and accountable owner.',
  'Keep sensitive actions behind explicit permissions and human review.',
  'Connect existing platforms before replacing systems that already work.',
  'Measure service quality, throughput, accuracy and adoption after launch.',
]

const Industries = () => (
  <div className="min-h-screen bg-[#080808] text-white">
    <Navbar />
    <main id="main-content">
      <section className="shell pb-24 pt-44 lg:pb-32 lg:pt-52" aria-labelledby="industries-heading">
        <p className="eyebrow">Solutions shaped around real operations</p>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,.82fr)] lg:items-end">
          <div>
            <h1 id="industries-heading" className="max-w-5xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              AI and automation built for the way your industry works.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-300 sm:text-xl">
              Codestra adapts engineering patterns to the workflows, data responsibilities, customer expectations and compliance boundaries of each organization.
            </p>
          </div>
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-7 sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FFD700]">Industry knowledge without shortcuts</p>
            <p className="mt-4 text-lg leading-8 text-neutral-200">
              We use reusable technical foundations, then validate every workflow against the people and rules that make your operation distinct.
            </p>
            <Link className="button button--gold mt-7" to="/contact/sales">
              Discuss your workflow <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-900 bg-neutral-950/60 py-24 lg:py-32" aria-labelledby="industry-list-heading">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow">High-impact sectors</p>
            <h2 id="industry-list-heading" className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Modernize work where coordination and information matter most.
            </h2>
            <p className="mt-6 text-lg leading-8 text-neutral-300">
              These are common starting points. The dedicated industry catalog expands them into focused use cases, implementation patterns and project questions.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {industries.map(({ name, description, icon: Icon }) => (
              <article key={name} className="rounded-[1.75rem] border border-neutral-800 bg-[#101011] p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFD700] text-black" aria-hidden="true">
                  <Icon size={23} />
                </span>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em]">{name}</h3>
                <p className="mt-4 leading-7 text-neutral-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-24 lg:py-32" aria-labelledby="industry-principles-heading">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-24">
          <div>
            <p className="eyebrow">A responsible implementation model</p>
            <h2 id="industry-principles-heading" className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Apply AI with control, context and measurable value.
            </h2>
            <p className="mt-6 text-lg leading-8 text-neutral-300">
              Industry software succeeds when it respects operating reality. Codestra treats security, data quality, permissions and fallback procedures as product requirements.
            </p>
          </div>

          <ul className="grid gap-4" aria-label="Codestra industry implementation principles">
            {principles.map((principle, index) => (
              <li key={principle} className="grid gap-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:grid-cols-[54px_1fr] sm:items-center sm:p-7">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#FFD700]/50 text-sm font-black text-[#FFD700]" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-lg leading-8 text-neutral-200">{principle}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell pb-24 lg:pb-32" aria-labelledby="industries-cta-heading">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-8 sm:p-12 lg:p-16">
          <p className="eyebrow">Your workflow is the starting point</p>
          <h2 id="industries-cta-heading" className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Show us the process your team needs to improve.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            We will map the opportunity, integration boundaries and safest path to a useful first release.
          </p>
          <Link className="button button--gold mt-8" to="/contact/sales">
            Start a conversation <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default Industries
