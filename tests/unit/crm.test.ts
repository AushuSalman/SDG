/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { crmProvider } from '@/lib/integrations/crm'
import { createLead, mapContact, resetHubspotCache } from '@/lib/integrations/hubspot'
import type { CrmLead } from '@/lib/integrations/lead'

const lead: CrmLead = {
  name: 'Shot Buyer', mobile: '+919876543210', email: 'shot@example.com', project: 'SDG Prinia', enquiryType: 'home', purpose: 'end-use',
  budgetBand: '2-4cr', timeline: '0-3m', source: 'website', utm: { utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'prinia-launch' },
  message: 'Wants a corner flat', score: 92, band: 'hot', websiteEnquiryId: 'enq-1',
}

type Call = { url: string; method: string; body?: unknown }
let calls: Call[]
let responders: ((c: Call) => Response | undefined)[]
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

beforeEach(() => {
  calls = []
  responders = []
  resetHubspotCache()
  process.env.HUBSPOT_ACCESS_TOKEN = 'test-token'
  process.env.HUBSPOT_API_URL = 'https://hubspot.test'
  delete process.env.PROPFLO_API_URL
  delete process.env.PROPFLO_API_KEY
  delete process.env.CRM_PROVIDER
  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    const call: Call = { url, method: init.method || 'GET', body: init.body ? JSON.parse(String(init.body)) : undefined }
    calls.push(call)
    for (const r of responders) { const res = r(call); if (res) return res }
    return json(404, {})
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('CRM provider selection', () => {
  it('prefers PropFlo when its credentials exist, else HubSpot, else nothing', () => {
    expect(crmProvider()).toBe('hubspot')
    process.env.PROPFLO_API_URL = 'https://propflo.test'
    process.env.PROPFLO_API_KEY = 'k'
    expect(crmProvider()).toBe('propflo')
    process.env.CRM_PROVIDER = 'hubspot'
    expect(crmProvider()).toBe('hubspot')
    delete process.env.HUBSPOT_ACCESS_TOKEN
    expect(crmProvider()).toBeNull()
  })
})

describe('HubSpot contact mapping', () => {
  it('splits the name, keeps the mobile as the match key and fills the SDG properties', () => {
    const p = mapContact(lead, true)
    expect(p).toMatchObject({ firstname: 'Shot', lastname: 'Buyer', phone: '+919876543210', email: 'shot@example.com', lifecyclestage: 'lead', hs_lead_status: 'NEW', message: 'Wants a corner flat' })
    expect(p).toMatchObject({ sdg_enquiry_id: 'enq-1', sdg_project: 'SDG Prinia', sdg_budget: '2-4cr', sdg_timeline: '0-3m', sdg_source: 'website / google / cpc', sdg_campaign: 'prinia-launch', sdg_score: 92, sdg_band: 'hot' })
  })

  it('folds the details into Message when custom properties are unavailable', () => {
    const p = mapContact(lead, false)
    expect(p.sdg_project).toBeUndefined()
    expect(String(p.message)).toContain('Wants a corner flat')
    expect(String(p.message)).toContain('SDG Prinia')
    expect(String(p.message)).toContain('score 92 (hot)')
  })

  it('never sends empty values', () => {
    const p = mapContact({ mobile: '+919000000000', enquiryType: 'general', source: 'website', websiteEnquiryId: 'x' }, true)
    expect(p.firstname).toBe('Website')
    expect('email' in p).toBe(false)
    expect('sdg_project' in p).toBe(false)
  })
})

describe('HubSpot createLead', () => {
  it('creates the properties once, then creates a new contact', async () => {
    responders.push((c) => (c.url.endsWith('/properties/contacts/sdg_enquiry_id') ? json(404, {}) : undefined))
    responders.push((c) => (c.url.endsWith('/properties/contacts/batch/create') ? json(201, {}) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts/search') ? json(200, { results: [] }) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts') && c.method === 'POST' ? json(201, { id: '501' }) : undefined))
    const r = await createLead(lead)
    expect(r).toEqual({ id: '501', contactId: '501' })
    const create = calls.find((c) => c.url.endsWith('/objects/contacts') && c.method === 'POST')!
    expect((create.body as { properties: Record<string, unknown> }).properties).toMatchObject({ phone: '+919876543210', sdg_enquiry_id: 'enq-1' })
    expect(calls.filter((c) => c.url.includes('/properties/contacts/batch/create'))).toHaveLength(1)
    // second lead in the same process: no property calls, search hit → update
    responders.unshift((c) => (c.url.endsWith('/objects/contacts/search') ? json(200, { results: [{ id: '501' }] }) : undefined))
    responders.unshift((c) => (c.url.endsWith('/objects/contacts/501') && c.method === 'PATCH' ? json(200, { id: '501' }) : undefined))
    const again = await createLead({ ...lead, websiteEnquiryId: 'enq-2' })
    expect(again.id).toBe('501')
    const patch = calls.find((c) => c.method === 'PATCH')!
    expect((patch.body as { properties: Record<string, unknown> }).properties.sdg_enquiry_id).toBe('enq-2')
    expect('lifecyclestage' in (patch.body as { properties: Record<string, unknown> }).properties).toBe(false)
    expect(calls.filter((c) => c.url.includes('/properties/contacts/batch/create'))).toHaveLength(1)
  })

  it('updates the existing contact when HubSpot reports a duplicate email', async () => {
    responders.push((c) => (c.url.endsWith('/properties/contacts/sdg_enquiry_id') ? json(200, {}) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts/search') ? json(200, { results: [] }) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts') && c.method === 'POST' ? new Response(JSON.stringify({ message: 'Contact already exists. Existing ID: 777' }), { status: 409 }) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts/777') && c.method === 'PATCH' ? json(200, {}) : undefined))
    const r = await createLead(lead)
    expect(r.id).toBe('777')
  })

  it('falls back to the Message property when the token cannot create properties', async () => {
    responders.push((c) => (c.url.endsWith('/properties/contacts/sdg_enquiry_id') ? json(403, { message: 'missing scope' }) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts/search') ? json(200, { results: [] }) : undefined))
    responders.push((c) => (c.url.endsWith('/objects/contacts') && c.method === 'POST' ? json(201, { id: '9' }) : undefined))
    await createLead(lead)
    const create = calls.find((c) => c.url.endsWith('/objects/contacts') && c.method === 'POST')!
    const props = (create.body as { properties: Record<string, unknown> }).properties
    expect(props.sdg_project).toBeUndefined()
    expect(String(props.message)).toContain('Enquiry enq-1')
  })
})
