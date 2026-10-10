import { useCallback, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { industryPages, servicePages } from '../../content/landingCatalog'
import TurnstileField from './TurnstileField'
import {
  createLeadId,
  identifyLeadAttempt,
  LEAD_FORM_VERSION,
  LeadApiError,
  submitLead,
  type LeadCommand,
} from './leadClient'

interface FormState {
  fullName: string
  workEmail: string
  phone: string
  companyName: string
  jobTitle: string
  companySize: string
  service: string
  industry: string
  budget: string
  timeline: string
  message: string
  privacyAccepted: boolean
  marketingOptIn: boolean
  website: string
}

type FieldErrors = Partial<Record<keyof FormState | 'turnstile', string>>
type SubmissionState =
  | { phase: 'idle'; message: '' }
  | { phase: 'submitting'; message: string }
  | { phase: 'success'; message: string }
  | { phase: 'error'; message: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LeadForm = () => {
  const location = useLocation()
  const initialQuery = new URLSearchParams(location.search)
  const startedAtRef = useRef(Date.now())
  const leadIdRef = useRef(createLeadId())
  const attemptRef = useRef<LeadCommand | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submission, setSubmission] = useState<SubmissionState>({ phase: 'idle', message: '' })
  const [form, setForm] = useState<FormState>({
    fullName: '',
    workEmail: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    companySize: '',
    service: initialQuery.get('service') || '',
    industry: initialQuery.get('industry') || '',
    budget: '',
    timeline: '',
    message: '',
    privacyAccepted: false,
    marketingOptIn: false,
    website: '',
  })

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), [])

  const setTextField = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const setBooleanField = (field: 'privacyAccepted' | 'marketingOptIn') => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.checked }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const nextErrors: FieldErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.'
    if (!EMAIL_PATTERN.test(form.workEmail.trim())) nextErrors.workEmail = 'Enter a valid work email.'
    if (form.companyName.trim().length < 2) nextErrors.companyName = 'Enter your company or organization.'
    if (!form.service) nextErrors.service = 'Choose the capability closest to your project.'
    if (form.message.trim().length < 20) nextErrors.message = 'Describe the workflow or opportunity in at least 20 characters.'
    if (!form.privacyAccepted) nextErrors.privacyAccepted = 'Accept the privacy notice so Codestra can respond.'
    if (import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() && !turnstileToken) nextErrors.turnstile = 'Complete the anti-abuse challenge.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submission.phase === 'submitting') return

    if (form.website.trim()) {
      setSubmission({ phase: 'success', message: 'Your request has been received.' })
      return
    }

    if (!validate()) {
      setSubmission({ phase: 'error', message: 'Review the highlighted fields before submitting.' })
      return
    }

    const query = new URLSearchParams(location.search)
    const command: LeadCommand = {
      schemaVersion: LEAD_FORM_VERSION,
      leadId: leadIdRef.current,
      submittedAt: new Date().toISOString(),
      campaign: {
        code: import.meta.env.VITE_ODOO_CAMPAIGN_CODE?.trim() || 'CODESTRA-WEB-AI',
      },
      contact: {
        fullName: form.fullName.trim(),
        workEmail: form.workEmail.trim().toLowerCase(),
        phone: form.phone.trim(),
      },
      company: {
        name: form.companyName.trim(),
        jobTitle: form.jobTitle.trim(),
        companySize: form.companySize,
      },
      qualification: {
        service: form.service,
        industry: form.industry,
        budget: form.budget,
        timeline: form.timeline,
        message: form.message.trim(),
      },
      consent: {
        privacyAccepted: form.privacyAccepted,
        marketingOptIn: form.marketingOptIn,
        policyVersion: '2026-08-26',
      },
      attribution: {
        landingPath: `${location.pathname}${location.search}`,
        referrer: document.referrer,
        utmSource: query.get('utm_source') || '',
        utmMedium: query.get('utm_medium') || '',
        utmCampaign: query.get('utm_campaign') || '',
        utmTerm: query.get('utm_term') || '',
        utmContent: query.get('utm_content') || '',
        clickId: query.get('gclid') || query.get('fbclid') || query.get('msclkid') || '',
      },
      antiAbuse: {
        turnstileToken,
        honeypot: form.website,
        dwellMs: Math.max(0, Date.now() - startedAtRef.current),
      },
    }

    const attempt = identifyLeadAttempt(command, attemptRef.current)
    attemptRef.current = attempt
    leadIdRef.current = attempt.leadId

    setSubmission({ phase: 'submitting', message: 'Sending your request through the secure Codestra gateway…' })

    try {
      const receipt = await submitLead(attempt)
      setSubmission({ phase: 'success', message: receipt.message })
      attemptRef.current = null
      leadIdRef.current = createLeadId()
      startedAtRef.current = Date.now()
      setForm((current) => ({
        ...current,
        fullName: '',
        workEmail: '',
        phone: '',
        companyName: '',
        jobTitle: '',
        companySize: '',
        budget: '',
        timeline: '',
        message: '',
        privacyAccepted: false,
        marketingOptIn: false,
      }))
      setTurnstileToken('')
    } catch (error) {
      const message = error instanceof LeadApiError
        ? error.message
        : 'The request could not be submitted. Please try again or email support@codestra.co.'
      setSubmission({ phase: 'error', message })
    }
  }

  const fieldError = (field: keyof FieldErrors) => errors[field]

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      <div className="lead-form__heading">
        <span>Project intake</span>
        <h2>Tell us where the work is getting stuck.</h2>
        <p>We use this context to prepare the first conversation—not to place you into a generic sales sequence.</p>
      </div>

      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" name="website" value={form.website} onChange={setTextField('website')} tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="lead-form__section">
        <legend>About you</legend>
        <div className="lead-form__grid">
          <label className="form-field">
            <span>Full name *</span>
            <input value={form.fullName} onChange={setTextField('fullName')} autoComplete="name" aria-invalid={Boolean(fieldError('fullName'))} />
            {fieldError('fullName') && <small role="alert">{fieldError('fullName')}</small>}
          </label>
          <label className="form-field">
            <span>Work email *</span>
            <input type="email" value={form.workEmail} onChange={setTextField('workEmail')} autoComplete="email" inputMode="email" aria-invalid={Boolean(fieldError('workEmail'))} />
            {fieldError('workEmail') && <small role="alert">{fieldError('workEmail')}</small>}
          </label>
          <label className="form-field">
            <span>Phone</span>
            <input type="tel" value={form.phone} onChange={setTextField('phone')} autoComplete="tel" inputMode="tel" />
          </label>
          <label className="form-field">
            <span>Company or organization *</span>
            <input value={form.companyName} onChange={setTextField('companyName')} autoComplete="organization" aria-invalid={Boolean(fieldError('companyName'))} />
            {fieldError('companyName') && <small role="alert">{fieldError('companyName')}</small>}
          </label>
          <label className="form-field">
            <span>Role</span>
            <input value={form.jobTitle} onChange={setTextField('jobTitle')} autoComplete="organization-title" />
          </label>
          <label className="form-field">
            <span>Company size</span>
            <select value={form.companySize} onChange={setTextField('companySize')}>
              <option value="">Select size</option>
              <option value="1-10">1–10 people</option>
              <option value="11-50">11–50 people</option>
              <option value="51-200">51–200 people</option>
              <option value="201-500">201–500 people</option>
              <option value="501-2000">501–2,000 people</option>
              <option value="2001+">2,001+ people</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="lead-form__section">
        <legend>About the opportunity</legend>
        <div className="lead-form__grid">
          <label className="form-field">
            <span>Primary service *</span>
            <select value={form.service} onChange={setTextField('service')} aria-invalid={Boolean(fieldError('service'))}>
              <option value="">Choose a service</option>
              {servicePages.map((page) => <option value={page.slug} key={page.slug}>{page.name}</option>)}
            </select>
            {fieldError('service') && <small role="alert">{fieldError('service')}</small>}
          </label>
          <label className="form-field">
            <span>Industry</span>
            <select value={form.industry} onChange={setTextField('industry')}>
              <option value="">Choose an industry</option>
              {industryPages.map((page) => <option value={page.slug} key={page.slug}>{page.name}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Estimated investment</span>
            <select value={form.budget} onChange={setTextField('budget')}>
              <option value="">Choose a range</option>
              <option value="discovery">Discovery first</option>
              <option value="10k-25k">$10,000–$25,000</option>
              <option value="25k-75k">$25,000–$75,000</option>
              <option value="75k-150k">$75,000–$150,000</option>
              <option value="150k+">$150,000+</option>
            </select>
          </label>
          <label className="form-field">
            <span>Target timeline</span>
            <select value={form.timeline} onChange={setTextField('timeline')}>
              <option value="">Choose a timeline</option>
              <option value="now">Ready to begin</option>
              <option value="30-days">Within 30 days</option>
              <option value="quarter">This quarter</option>
              <option value="planning">Planning for later</option>
            </select>
          </label>
          <label className="form-field form-field--full">
            <span>What should the system improve? *</span>
            <textarea rows={6} value={form.message} onChange={setTextField('message')} placeholder="Describe the workflow, users, current systems, repeated work, or result you need." aria-invalid={Boolean(fieldError('message'))} />
            {fieldError('message') && <small role="alert">{fieldError('message')}</small>}
          </label>
        </div>
      </fieldset>

      <TurnstileField onTokenChange={handleTurnstileToken} />
      {fieldError('turnstile') && <p className="form-level-error" role="alert">{fieldError('turnstile')}</p>}

      <div className="lead-form__consent">
        <label>
          <input type="checkbox" checked={form.privacyAccepted} onChange={setBooleanField('privacyAccepted')} />
          <span>I agree that Codestra may use this information to respond to my request, as described in the <Link to="/privacy">privacy notice</Link>. *</span>
        </label>
        {fieldError('privacyAccepted') && <small role="alert">{fieldError('privacyAccepted')}</small>}
        <label>
          <input type="checkbox" checked={form.marketingOptIn} onChange={setBooleanField('marketingOptIn')} />
          <span>Send me occasional Codestra product and AI automation insights. I can unsubscribe at any time.</span>
        </label>
      </div>

      {submission.phase !== 'idle' && (
        <div className={`submission-message submission-message--${submission.phase}`} role="status" aria-live="polite">
          {submission.phase === 'submitting' && <LoaderCircle className="spin" size={19} />}
          {submission.phase === 'success' && <CheckCircle2 size={19} />}
          {submission.phase === 'error' && <CircleAlert size={19} />}
          <span>{submission.message}</span>
        </div>
      )}

      <button className="button button--primary lead-form__submit" type="submit" disabled={submission.phase === 'submitting'}>
        {submission.phase === 'submitting' ? 'Submitting…' : 'Send project request'}
        {submission.phase !== 'submitting' && <ArrowRight size={18} />}
      </button>
      <p className="lead-form__version">Secure form contract v{LEAD_FORM_VERSION} · Routed through Caddy and Kong · No Odoo credentials in the browser</p>
    </form>
  )
}

export default LeadForm
