import { useLocation } from 'react-router'
import PageMeta from './PageMeta'

interface StaticMeta {
  title: string
  description: string
}

const routeMeta: Record<string, StaticMeta> = {
  '/': {
    title: 'Codestra | AI Development, Automation & Software Engineering',
    description: 'Codestra designs AI systems, business automation, custom software and secure integrations for ambitious companies.',
  },
  '/about': {
    title: 'About Codestra | AI and Software Engineering Company',
    description: 'Meet the team and engineering principles behind Codestra AI, automation, software development and integration services.',
  },
  '/services': {
    title: 'AI, Automation and Software Development Services | Codestra',
    description: 'Explore Codestra services for AI development, workflow automation, web and mobile applications, APIs, cloud and data platforms.',
  },
  '/case-studies': {
    title: 'Codestra Case Studies | AI, Automation and Digital Products',
    description: 'See how Codestra approaches secure software delivery, AI integration, automation and modern digital product development.',
  },
  '/contact': {
    title: 'Contact Codestra | Start an AI or Software Project',
    description: 'Contact Codestra to discuss AI development, business automation, Odoo integration, APIs, web applications or mobile products.',
  },
  '/contact/sales': {
    title: 'Talk to Codestra Sales | AI and Automation Consultation',
    description: 'Request a consultation for AI development, automation, custom software, Odoo CRM and secure business integrations.',
  },
  '/contact/support': {
    title: 'Codestra Support | Product and Technical Assistance',
    description: 'Reach Codestra support for product questions, technical assistance and help with an existing engagement.',
  },
  '/electronic-billing': {
    title: 'Electronic Billing Solutions | Codestra',
    description: 'Learn about secure electronic billing workflows, integrations and automation delivered by Codestra.',
  },
  '/electronic-billing/form': {
    title: 'Electronic Billing Project Form | Codestra',
    description: 'Share your electronic billing requirements with Codestra and request a structured implementation consultation.',
  },
  '/hiring/positions': {
    title: 'Careers at Codestra | Engineering and Digital Roles',
    description: 'Explore opportunities to work with Codestra on AI, automation, software engineering and digital product delivery.',
  },
  '/privacy': {
    title: 'Codestra Privacy Policy',
    description: 'Read how Codestra handles information submitted through its website, forms and digital services.',
  },
  '/login': {
    title: 'Codestra Client Login',
    description: 'Sign in to your Codestra client workspace.',
  },
  '/signup': {
    title: 'Create a Codestra Account',
    description: 'Create an account to access your Codestra workspace and project services.',
  },
}

const RouteMeta = () => {
  const { pathname } = useLocation()
  const meta = routeMeta[pathname]
  if (!meta) return null
  return <PageMeta {...meta} path={pathname} />
}

export default RouteMeta
