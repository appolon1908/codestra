import type { ReactNode } from "react";
import Footer from "../../Components/Layouts/Footer";
import Navbar from "../../Components/Layouts/Navbar";
import LocalizedLink from "../../i18n/LocalizedLink";
import { businessProfile, formatMainOffice } from "../../config/businessProfile";

type Section = { title: string; body: ReactNode };

const pageData: Record<string, { eyebrow: string; title: string; intro: string; sections: Section[] }> = {
  "software-development": { eyebrow: "Custom software", title: "Software built around the way your team operates", intro: "Codestra designs and develops web applications, internal tools, integrations and customer-facing platforms for defined business workflows.", sections: [
    { title: "What we deliver", body: "Discovery, technical planning, user experience, implementation, testing, deployment support and documented handoff for an agreed project scope." },
    { title: "How projects are priced", body: "Custom development is quoted in USD after discovery. Scope, milestones, customer responsibilities, acceptance and support are documented in the proposal or service agreement before work begins." },
    { title: "What we do not promise", body: "Timelines and outcomes depend on the approved scope, system dependencies and timely customer feedback. A consultation is not a guarantee of availability or a specific result." },
  ]},
  "ai-automation": { eyebrow: "AI and automation", title: "Practical automation with defined human control", intro: "Codestra connects approved data, business rules and AI-assisted workflows to reduce repetitive work while preserving escalation paths.", sections: [
    { title: "Common engagements", body: "Lead intake, document routing, customer-service assistance, workflow orchestration, reporting and system-to-system automation." },
    { title: "Responsible delivery", body: "Projects define approved knowledge sources, restricted actions, review points, access controls and human escalation before production use." },
    { title: "Operational fit", body: "Automation is tailored to the customer's systems and requirements. Codestra does not represent AI output as professional legal, medical or financial advice." },
  ]},
  "odoo-crm": { eyebrow: "Odoo and CRM", title: "CRM and operations workflows that share reliable context", intro: "Codestra implements and integrates Odoo and related CRM workflows for teams that need clearer records, handoffs and reporting.", sections: [
    { title: "Implementation scope", body: "Process discovery, configuration, approved customizations, data-migration planning, integrations, testing and team handoff." },
    { title: "Customer dependencies", body: "Successful delivery depends on access to accurate source data, authorized system owners and timely review of configured workflows." },
    { title: "Commercial model", body: "Odoo and CRM engagements are custom-quoted in USD. Third-party software licenses and services are identified separately when applicable." },
  ]},
  "contact-center": { eyebrow: "Contact-center integration", title: "Voice and messaging workflows connected to real operations", intro: "Codestra integrates contact-center, CRM and automation systems so approved conversations can reach the right team and record.", sections: [
    { title: "Typical scope", body: "Call routing, service-message workflows, CRM synchronization, reporting, escalation and integration with approved providers." },
    { title: "Consent boundaries", body: "A service inquiry does not enroll a person in marketing. SMS and email marketing require separate optional consent and must honor suppression records." },
    { title: "Carrier and provider dependencies", body: "Availability, delivery and registration depend on carriers and third-party providers. Codestra does not claim carrier approval or guaranteed delivery." },
  ]},
};

function Shell({ children }: { children: ReactNode }) {
  return <><Navbar /><main id="main-content" className="mx-auto min-h-[70vh] max-w-6xl px-5 pb-16 pt-32 lg:px-10 lg:pt-44">{children}</main><Footer /></>;
}

export function ServiceDetailPage({ kind }: { kind: keyof typeof pageData }) {
  const page = pageData[kind];
  return <Shell><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#FFD700]">{page.eyebrow}</p><h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight lg:text-5xl">{page.title}</h1><p className="mt-6 max-w-3xl text-base leading-7 text-neutral-300 lg:text-lg">{page.intro}</p><div className="mt-12 grid gap-5 lg:grid-cols-3">{page.sections.map((section) => <section key={section.title} className="rounded-2xl border border-neutral-800 bg-[#151517] p-6"><h2 className="text-xl font-semibold">{section.title}</h2><p className="mt-4 leading-7 text-neutral-300">{section.body}</p></section>)}</div><div className="mt-12 flex flex-wrap gap-4"><LocalizedLink className="rounded-full bg-[#FFD700] px-6 py-3 font-semibold text-black" to="/contact/sales">Discuss a project</LocalizedLink><LocalizedLink className="rounded-full border border-neutral-700 px-6 py-3" to="/how-it-works">See how delivery works</LocalizedLink></div></Shell>;
}

export function HowItWorksPage() {
  const steps = [
    ["1", "Consultation", "We learn the workflow, constraints, decision-makers and desired outcome."],
    ["2", "Proposal", "Codestra documents scope, assumptions, USD pricing, milestones and customer dependencies."],
    ["3", "Project authorization", "Work begins only after the applicable agreement and any stated initial invoice or deposit are completed."],
    ["4", "Development and testing", "The team builds against the approved scope and reviews testable milestones."],
    ["5", "Acceptance and delivery", "The customer reviews agreed acceptance criteria, provides feedback and approves delivery according to the signed agreement."],
    ["6", "Support", "Post-delivery support follows the scope and duration stated in the applicable proposal, subscription or support agreement."],
  ];
  return <Shell><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#FFD700]">How it works</p><h1 className="mt-4 text-3xl font-semibold lg:text-5xl">A clear path from operational need to supported delivery</h1><p className="mt-6 max-w-3xl leading-7 text-neutral-300">Every engagement is scoped individually. Commercial commitments come from the signed proposal or agreement—not from estimates shown during an introductory conversation.</p><ol className="mt-12 grid gap-5 md:grid-cols-2">{steps.map(([number,title,body]) => <li key={number} className="rounded-2xl border border-neutral-800 bg-[#151517] p-6"><span className="text-sm font-bold text-[#FFD700]">STEP {number}</span><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-neutral-300">{body}</p></li>)}</ol></Shell>;
}

export function SupportPage() {
  return <Shell><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#FFD700]">Support</p><h1 className="mt-4 text-3xl font-semibold lg:text-5xl">Contact Codestra support</h1><p className="mt-6 max-w-2xl leading-7 text-neutral-300">For service questions, account assistance or an existing project, email our verified support channel. Do not send passwords, payment-card data or sensitive personal information.</p><div className="mt-10 rounded-2xl border border-neutral-800 bg-[#151517] p-6"><h2 className="text-xl font-semibold">Verified support contact</h2><a className="mt-4 inline-flex min-h-11 items-center text-[#FFD700] underline" href={`mailto:${businessProfile.supportEmail}`}>{businessProfile.supportEmail}</a><p className="mt-4 text-sm text-neutral-400">Operating timezone: {businessProfile.operatingTimezoneLabel}. Published support hours and a verified support telephone number are not currently available.</p><p className="mt-3 text-sm text-neutral-400">Mailing address: {formatMainOffice()}</p></div></Shell>;
}

export function AccessibilityPage() {
  return <Shell><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#FFD700]">Accessibility</p><h1 className="mt-4 text-3xl font-semibold lg:text-5xl">A more usable Codestra website for everyone</h1><p className="mt-6 max-w-3xl leading-7 text-neutral-300">Codestra is working toward WCAG 2.2 Level AA across public website experiences. This is a readiness target, not a certification claim.</p><div className="mt-10 grid gap-5 md:grid-cols-2"><section className="rounded-2xl border border-neutral-800 bg-[#151517] p-6"><h2 className="text-xl font-semibold">Our approach</h2><p className="mt-3 leading-7 text-neutral-300">We review keyboard access, visible focus, semantic structure, labels, contrast, reduced motion, zoom and responsive reflow as part of website quality work.</p></section><section className="rounded-2xl border border-neutral-800 bg-[#151517] p-6"><h2 className="text-xl font-semibold">Report a barrier</h2><p className="mt-3 leading-7 text-neutral-300">Describe the page, task and assistive technology involved. Email <a className="text-[#FFD700] underline" href={`mailto:${businessProfile.supportEmail}`}>{businessProfile.supportEmail}</a>.</p></section></div></Shell>;
}

export function CorporateProfilePage() {
  return <Shell><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#FFD700]">Company profile</p><h1 className="mt-4 text-3xl font-semibold lg:text-5xl">Codestra operates through distinct U.S. and Dominican entities</h1><div className="mt-10 grid gap-5 md:grid-cols-2"><section className="rounded-2xl border border-neutral-800 bg-[#151517] p-6"><h2 className="text-xl font-semibold">Main office — United States</h2><p className="mt-3 leading-7 text-neutral-300">{businessProfile.legalOperator.name}<br />{formatMainOffice()}</p></section><section className="rounded-2xl border border-neutral-800 bg-[#151517] p-6"><h2 className="text-xl font-semibold">Dominican Republic office</h2><p className="mt-3 leading-7 text-neutral-300">{businessProfile.affiliate.name}<br />Dominican Republic</p></section></div><p className="mt-8 max-w-3xl text-sm leading-6 text-neutral-400">Contracts, invoices and service-specific notices identify the entity responsible for that engagement. The entities are not presented interchangeably.</p></Shell>;
}
