export const LEAD_FORM_VERSION = '1.0'
const DEFAULT_ENDPOINT = '/api/leads/v1/consultations'
const DEFAULT_TIMEOUT_MS = 12_000

export interface LeadAttribution {
  landingPath: string
  referrer: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
  clickId: string
}

export interface LeadCommand {
  schemaVersion: typeof LEAD_FORM_VERSION
  leadId: string
  submittedAt: string
  campaign: {
    code: string
  }
  contact: {
    fullName: string
    workEmail: string
    phone: string
  }
  company: {
    name: string
    jobTitle: string
    companySize: string
  }
  qualification: {
    service: string
    industry: string
    budget: string
    timeline: string
    message: string
  }
  consent: {
    privacyAccepted: boolean
    marketingOptIn: boolean
    policyVersion: string
  }
  attribution: LeadAttribution
  antiAbuse: {
    turnstileToken: string
    honeypot: string
    dwellMs: number
  }
}

export interface LeadReceipt {
  leadId: string
  status: 'accepted' | 'duplicate'
  message: string
  correlationId?: string
}

export class LeadApiError extends Error {
  readonly status: number
  readonly code: string
  readonly correlationId?: string

  constructor(message: string, status: number, code = 'LEAD_SUBMISSION_FAILED', correlationId?: string) {
    super(message)
    this.name = 'LeadApiError'
    this.status = status
    this.code = code
    this.correlationId = correlationId
  }
}

export const createLeadId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

const safeJson = async (response: Response): Promise<Record<string, unknown>> => {
  try {
    const value: unknown = await response.json()
    return value && typeof value === 'object' ? value as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

export const submitLead = async (command: LeadCommand): Promise<LeadReceipt> => {
  const endpoint = import.meta.env.VITE_LEAD_CAPTURE_ENDPOINT?.trim() || DEFAULT_ENDPOINT
  const configuredTimeout = Number(import.meta.env.VITE_LEAD_CAPTURE_TIMEOUT_MS)
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': command.leadId,
        'X-Codestra-Form-Version': LEAD_FORM_VERSION,
      },
      body: JSON.stringify(command),
      signal: controller.signal,
    })

    const body = await safeJson(response)
    const correlationId = response.headers.get('X-Correlation-ID') || undefined

    if (!response.ok) {
      const message = typeof body.message === 'string'
        ? body.message
        : response.status === 429
          ? 'Too many requests. Please pause before trying again.'
          : 'The request could not be accepted. Please review the form and try again.'
      const code = typeof body.code === 'string' ? body.code : `HTTP_${response.status}`
      throw new LeadApiError(message, response.status, code, correlationId)
    }

    return {
      leadId: typeof body.leadId === 'string' ? body.leadId : command.leadId,
      status: body.status === 'duplicate' ? 'duplicate' : 'accepted',
      message: typeof body.message === 'string'
        ? body.message
        : 'Your request has been received. A Codestra specialist will follow up.',
      correlationId,
    }
  } catch (error) {
    if (error instanceof LeadApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new LeadApiError('The request timed out before the gateway responded. Please try once more.', 408, 'REQUEST_TIMEOUT')
    }
    throw new LeadApiError('The request could not reach the secure lead gateway. Please try again or email support@codestra.co.', 0, 'NETWORK_ERROR')
  } finally {
    window.clearTimeout(timeout)
  }
}
