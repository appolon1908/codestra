import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LEAD_FORM_VERSION,
  LeadApiError,
  submitLead,
  type LeadCommand,
} from './leadClient'

const command: LeadCommand = {
  schemaVersion: LEAD_FORM_VERSION,
  leadId: '2b3fca51-f421-4e7e-bc3d-6a47fb54bcfa',
  submittedAt: '2026-08-26T12:00:00.000Z',
  campaign: { code: 'CODESTRA-WEB-AI' },
  contact: {
    fullName: 'Ada Lovelace',
    workEmail: 'ada@example.com',
    phone: '+1 555 0100',
  },
  company: {
    name: 'Analytical Engines LLC',
    jobTitle: 'Founder',
    companySize: '11-50',
  },
  qualification: {
    service: 'ai-agent-development',
    industry: 'professional-services',
    budget: '25k-75k',
    timeline: 'quarter',
    message: 'We need to automate a multi-step research and CRM workflow.',
  },
  consent: {
    privacyAccepted: true,
    marketingOptIn: false,
    policyVersion: '2026-08-26',
  },
  attribution: {
    landingPath: '/services/ai-agent-development',
    referrer: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    clickId: '',
  },
  antiAbuse: {
    turnstileToken: 'test-token',
    honeypot: '',
    dwellMs: 5000,
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('submitLead', () => {
  it('sends the version and matching idempotency key to the same-origin gateway', async () => {
    vi.stubEnv('VITE_LEAD_CAPTURE_ENDPOINT', '/api/leads/v1/consultations')
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        leadId: command.leadId,
        status: 'accepted',
        message: 'Accepted',
      }),
      {
        status: 202,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': 'correlation-123',
        },
      },
    ))
    vi.stubGlobal('fetch', fetchMock)

    const result = await submitLead(command)

    expect(result.status).toBe('accepted')
    expect(result.correlationId).toBe('correlation-123')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/leads/v1/consultations')
    expect(options.credentials).toBe('omit')
    expect(options.redirect).toBe('error')
    expect(options.headers).toMatchObject({
      'Content-Type': 'application/json',
      'Idempotency-Key': command.leadId,
      'X-Codestra-Form-Version': LEAD_FORM_VERSION,
    })
    expect(JSON.parse(String(options.body))).toEqual(command)
  })

  it('surfaces a safe gateway error with its correlation ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        code: 'CAMPAIGN_NOT_ALLOWED',
        message: 'The selected campaign is not available.',
      }),
      {
        status: 422,
        headers: {
          'Content-Type': 'application/problem+json',
          'X-Correlation-ID': 'correlation-456',
        },
      },
    ))
    vi.stubGlobal('fetch', fetchMock)

    await expect(submitLead(command)).rejects.toMatchObject<Partial<LeadApiError>>({
      name: 'LeadApiError',
      status: 422,
      code: 'CAMPAIGN_NOT_ALLOWED',
      correlationId: 'correlation-456',
    })
  })
})
