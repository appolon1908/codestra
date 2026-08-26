const normalizeDescription = (value) => {
  let text = String(value).replace(/\s+/g, ' ').trim()
  if (text.length > 176) {
    const shortened = text.slice(0, 173)
    const lastSpace = shortened.lastIndexOf(' ')
    text = `${(lastSpace > 0 ? shortened.slice(0, lastSpace) : shortened).replace(/[,;:]$/, '')}.`
  }
  if (text.length < 105) text = `${text.replace(/\.$/, '')} with secure, production-minded delivery.`
  return text
}

const servicePage = (spec, related) => {
  const name = spec.name
  const useCases = spec.use_cases
  const keyword = name.toLowerCase()
  const descriptions = [
    (use) => `Design ${use.toLowerCase()} around defined users, inputs, approvals and the operational system of record.`,
    (use) => `Connect ${use.toLowerCase()} to the data and APIs required for a complete, observable workflow.`,
    (use) => `Apply validation, exception handling and measurable quality checks to ${use.toLowerCase()} before scale.`,
    (use) => `Create a maintainable operating model for ${use.toLowerCase()}, including ownership, monitoring and change control.`,
  ]

  return {
    kind: 'service',
    slug: spec.slug,
    name,
    eyebrow: 'AI, automation and software service',
    seoTitle: `${name} Services | Codestra`,
    description: normalizeDescription(`Codestra delivers ${name} for ${useCases[0].toLowerCase()}, ${useCases[1].toLowerCase()} and secure integration with existing business systems.`),
    headline: `${name} built around the work—not the demo.`,
    intro: `Codestra helps ${spec.audience} ${spec.result}. We combine ${spec.core} with the software, APIs and operating controls needed for production.`,
    challenge: `The difficult part is rarely the isolated model or feature. The value appears when it can use trusted context, work across ${spec.systems}, handle exceptions and leave the business with a clear next action.`,
    primaryKeyword: keyword,
    keywords: [keyword, `custom ${keyword}`, `${keyword} company`, `${keyword} integration`, `enterprise ${keyword}`],
    outcomes: [
      `Move ${useCases[0].toLowerCase()} from disconnected steps into a visible, repeatable workflow.`,
      `Connect ${spec.systems} through explicit, secure service boundaries.`,
      `Operate with ${spec.governance} from the first production release.`,
    ],
    capabilities: useCases.map((use, index) => ({ title: use, description: descriptions[index](use) })),
    approach: [
      { title: 'Discover the production path', description: `Map the users, decisions, data, exceptions and business measure for ${name.toLowerCase()} before selecting the implementation pattern.` },
      { title: 'Build one complete workflow', description: `Deliver a narrow vertical slice across interface, intelligence, integration and system-of-record outcome so ${name.toLowerCase()} can be tested with real work.` },
      { title: 'Harden and expand', description: `Evaluate quality, reliability and adoption; then extend ${name.toLowerCase()} only where the evidence supports the next workflow.` },
    ],
    faq: [
      { question: `What should a ${name.toLowerCase()} project start with?`, answer: 'Start with one valuable workflow that has clear inputs, owners, exceptions and a measurable result. Codestra uses that path to define the minimum production architecture before expanding scope.' },
      { question: `Can ${name.toLowerCase()} connect to our existing systems?`, answer: `Yes. The implementation can connect to ${spec.systems} through authenticated APIs and middleware. Internal services should remain private rather than being called directly from the browser.` },
      { question: `How do you control risk in ${name.toLowerCase()}?`, answer: `The design includes ${spec.governance}. Controls are matched to the action being taken, the sensitivity of the data and the cost of an incorrect result.` },
    ],
    related,
  }
}

const industryPage = (spec, related) => {
  const name = spec.name
  const keyword = `AI automation for ${name.toLowerCase()}`
  const descriptions = [
    (workflow) => `Capture the right context for ${workflow.toLowerCase()} and route it to the correct team or system without repeated entry.`,
    (workflow) => `Use approved knowledge and operational data to assist ${workflow.toLowerCase()} while preserving clear escalation paths.`,
    (workflow) => `Connect ${workflow.toLowerCase()} to the systems of record so updates, ownership and next actions stay visible.`,
    (workflow) => `Measure quality and cycle time for ${workflow.toLowerCase()} so the workflow can improve after launch.`,
  ]

  return {
    kind: 'industry',
    slug: spec.slug,
    name,
    eyebrow: `AI and automation for ${name}`,
    seoTitle: `AI & Automation for ${name} | Codestra`,
    description: normalizeDescription(`Codestra builds AI and automation for ${name.toLowerCase()}, improving ${spec.workflows[0].toLowerCase()}, ${spec.workflows[1].toLowerCase()} and connected operational follow-through.`),
    headline: `Practical AI and automation for ${name.toLowerCase()} operations.`,
    intro: `Codestra helps ${spec.teams} reduce friction created by ${spec.pressure}. We design focused AI, software and automation workflows that connect to the systems people already use.`,
    challenge: `In ${name.toLowerCase()}, a useful solution must fit real operating constraints—not just produce an answer. It needs dependable context from ${spec.systems}, clear ownership and controls such as ${spec.guard}.`,
    primaryKeyword: keyword,
    keywords: [keyword, `AI for ${name.toLowerCase()}`, `${name.toLowerCase()} workflow automation`, `${name.toLowerCase()} software development`, `${name.toLowerCase()} AI integration`],
    outcomes: [
      `Shorten the handoffs around ${spec.workflows[0].toLowerCase()} without hiding ownership.`,
      `Create a governed integration layer across ${spec.systems}.`,
      `Introduce AI with ${spec.guard} built into the operating workflow.`,
    ],
    capabilities: spec.workflows.map((workflow, index) => ({ title: workflow, description: descriptions[index](workflow) })),
    approach: [
      { title: 'Choose a costly workflow', description: `Identify where ${spec.pressure} creates measurable delay, rework or poor service for ${spec.teams}.` },
      { title: 'Connect the real systems', description: `Build the workflow around authenticated access to ${spec.systems}, with explicit data and action boundaries.` },
      { title: 'Operate with industry controls', description: `Test the workflow with real users and enforce ${spec.guard} before expanding to additional ${name.toLowerCase()} use cases.` },
    ],
    faq: [
      { question: `Where can AI create value in ${name.toLowerCase()}?`, answer: `Good starting points include ${spec.workflows.slice(0, 3).map((item) => item.toLowerCase()).join(', ')}. The best first project has enough volume to matter and a clear human owner for exceptions.` },
      { question: `Can Codestra integrate with existing ${name.toLowerCase()} software?`, answer: `Yes. Codestra designs an API and middleware layer around ${spec.systems}. The goal is to improve the workflow without exposing private systems directly or replacing stable platforms unnecessarily.` },
      { question: `How is risk handled for ${name.toLowerCase()} AI?`, answer: `The production design includes ${spec.guard}. Higher-impact decisions remain under the appropriate human authority, with logging and review matched to the workflow.` },
    ],
    related,
  }
}

export const buildLandingPages = (serviceSpecs, industrySpecs) => {
  const serviceSlugs = serviceSpecs.map((spec) => spec.slug)
  const industrySlugs = industrySpecs.map((spec) => spec.slug)
  const related = (slugs, index) => [1, 2, 3].map((offset) => slugs[(index + offset) % slugs.length])

  return [
    ...serviceSpecs.map((spec, index) => servicePage(spec, related(serviceSlugs, index))),
    ...industrySpecs.map((spec, index) => industryPage(spec, related(industrySlugs, index))),
  ]
}
