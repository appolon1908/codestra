import { FormEvent, useState } from 'react'
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { useContact } from '../../hooks/mutations/useContact'

interface ContactPageProps { kind: 'general' | 'sales' | 'support' }

const copy = {
  general: ['Let’s start a conversation', 'Tell us what you are working toward. We will connect you with the right person.'],
  sales: ['Plan your next move', 'Share your goals, timeline, and current challenges. We will respond with a practical next step.'],
  support: ['Get the help you need', 'Tell us what is happening and how it affects your work. Our support team will follow up.'],
} as const

const ContactPage = ({ kind }: ContactPageProps) => {
  const [sent, setSent] = useState(false)
  const { mutate, isPending, isError } = useContact()
  const [title, description] = copy[kind]
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    mutate({
      full_name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      company_size: String(data.get('company') || 'Not provided'),
      message: `[${kind}] ${String(data.get('message') || '')}`,
    }, { onSuccess: () => { setSent(true); form.reset() } })
  }

  return <section className="section-pad page-hero">
    <div className="page-wrap contact-layout">
      <div>
        <p className="eyebrow">{kind === 'support' ? 'Customer support' : 'Contact Codestra'}</p>
        <h1>{title}</h1>
        <p className="hero-copy">{description}</p>
        <div className="contact-details">
          <a href="mailto:support@codestra.com"><Mail size={19} />support@codestra.com</a>
          <a href="tel:+18097347580"><Phone size={19} />+1 809 734 7580</a>
          <p><MapPin size={19} />Santo Domingo, Dominican Republic</p>
        </div>
      </div>
      <form className="modern-form" onSubmit={submit}>
        {sent && <div className="success-message" role="status"><CheckCircle2 size={20} />Thanks—we received your message and will follow up shortly.</div>}
        {isError && <div className="error-message" role="alert">We could not send your message. Please try again or email support@codestra.com.</div>}
        <label>Full name<input name="name" autoComplete="name" required /></label>
        <label>Work email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Company<input name="company" autoComplete="organization" /></label>
        <label>{kind === 'support' ? 'How can we help?' : 'What would you like to achieve?'}<textarea name="message" rows={5} required /></label>
        <button className="button button-primary" type="submit" disabled={isPending}>{isPending ? 'Sending…' : <>Send message <ArrowRight size={17} /></>}</button>
      </form>
    </div>
  </section>
}

export default ContactPage
