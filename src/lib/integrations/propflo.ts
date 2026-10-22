/**
 * PropFlo CRM adapter. SDG uses PropFlo for real-estate leads and has a sandbox (questionnaire Q1, Q2).
 * The exact request shape is confirmed against the sandbox in the spike; keep all mapping in mapLead().
 * Live when PROPFLO_API_URL and PROPFLO_API_KEY are set, otherwise the sync is marked "skipped".
 */
import type { CrmLead } from './lead'

export type PropfloLead = CrmLead

export function mapLead(lead: PropfloLead): Record<string, unknown> {
  return {
    name: lead.name || 'Website enquiry',
    mobile: lead.mobile,
    email: lead.email || undefined,
    project: lead.project || undefined,
    enquiry_type: lead.enquiryType,
    purpose: lead.purpose || undefined,
    budget: lead.budgetBand || undefined,
    timeline: lead.timeline || undefined,
    source: lead.source,
    sub_source: lead.utm?.utmSource || undefined,
    campaign: lead.utm?.utmCampaign || undefined,
    medium: lead.utm?.utmMedium || undefined,
    notes: lead.message || undefined,
    website_score: lead.score ?? undefined,
    website_band: lead.band ?? undefined,
    external_id: lead.websiteEnquiryId,
  }
}

export function propfloConfigured(): boolean {
  return Boolean(process.env.PROPFLO_API_URL && process.env.PROPFLO_API_KEY)
}

export async function createLead(lead: PropfloLead): Promise<{ id: string; contactId?: string }> {
  const base = process.env.PROPFLO_API_URL!
  const res = await fetch(`${base.replace(/\/$/, '')}/leads`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.PROPFLO_API_KEY}`,
      'content-type': 'application/json',
      'x-idempotency-key': lead.websiteEnquiryId,
    },
    body: JSON.stringify(mapLead(lead)),
  })
  if (!res.ok) throw new Error(`PropFlo ${res.status}: ${await res.text()}`)
  const json = (await res.json().catch(() => ({}))) as { id?: string; lead_id?: string; contact_id?: string; contactId?: string; data?: { id?: string; contact_id?: string } }
  const contactId = json.contact_id || json.contactId || json.data?.contact_id
  return { id: String(json.id || json.lead_id || json.data?.id || ''), contactId: contactId ? String(contactId) : undefined }
}
