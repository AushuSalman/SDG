import type { CrmLead, CrmResult } from './lead'

/**
 * HubSpot CRM adapter (free tier is enough). Each website enquiry becomes, or updates, the contact with that
 * mobile number; the enquiry details go into custom "SDG" contact properties, created on first use when the
 * private app has the schema scope, otherwise written into the standard Message property.
 * Live when HUBSPOT_ACCESS_TOKEN is set (Settings → Integrations → Private apps → Access token).
 * Scopes: crm.objects.contacts.read, crm.objects.contacts.write, crm.schemas.contacts.read, crm.schemas.contacts.write.
 */
const api = () => (process.env.HUBSPOT_API_URL || 'https://api.hubapi.com').replace(/\/$/, '')
const headers = () => ({ authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, 'content-type': 'application/json' })

export function hubspotConfigured(): boolean {
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN)
}

/** Custom contact properties that carry the website's structured enquiry data. */
export const SDG_PROPERTIES = [
  { name: 'sdg_enquiry_id', label: 'SDG enquiry ID', type: 'string', fieldType: 'text' },
  { name: 'sdg_enquiry_type', label: 'SDG enquiry type', type: 'string', fieldType: 'text' },
  { name: 'sdg_project', label: 'SDG project', type: 'string', fieldType: 'text' },
  { name: 'sdg_purpose', label: 'SDG purpose', type: 'string', fieldType: 'text' },
  { name: 'sdg_budget', label: 'SDG budget band', type: 'string', fieldType: 'text' },
  { name: 'sdg_timeline', label: 'SDG timeline', type: 'string', fieldType: 'text' },
  { name: 'sdg_source', label: 'SDG source', type: 'string', fieldType: 'text' },
  { name: 'sdg_campaign', label: 'SDG campaign', type: 'string', fieldType: 'text' },
  { name: 'sdg_score', label: 'SDG lead score', type: 'number', fieldType: 'number' },
  { name: 'sdg_band', label: 'SDG lead band', type: 'string', fieldType: 'text' },
] as const

const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''))

/** Contact properties for a lead. With `custom` false the structured details are folded into Message. */
export function mapContact(lead: CrmLead, custom: boolean): Record<string, string | number> {
  const [firstname, ...rest] = (lead.name || 'Website enquiry').trim().split(/\s+/)
  const details = [
    `Enquiry ${lead.websiteEnquiryId}`, lead.enquiryType, lead.project, lead.purpose, lead.budgetBand && `budget ${lead.budgetBand}`,
    lead.timeline && `timeline ${lead.timeline}`, `via ${lead.source}`, lead.utm?.utmCampaign && `campaign ${lead.utm.utmCampaign}`,
    lead.score != null && `score ${lead.score}${lead.band ? ` (${lead.band})` : ''}`,
  ].filter(Boolean).join(' · ')
  const base = {
    firstname,
    lastname: rest.join(' '),
    phone: lead.mobile,
    email: lead.email || undefined,
    lifecyclestage: 'lead',
    hs_lead_status: 'NEW',
    message: custom ? lead.message || undefined : [lead.message, details].filter(Boolean).join('\n\n'),
  }
  const sdg = custom
    ? {
        sdg_enquiry_id: lead.websiteEnquiryId,
        sdg_enquiry_type: lead.enquiryType,
        sdg_project: lead.project || undefined,
        sdg_purpose: lead.purpose || undefined,
        sdg_budget: lead.budgetBand || undefined,
        sdg_timeline: lead.timeline || undefined,
        sdg_source: [lead.source, lead.utm?.utmSource, lead.utm?.utmMedium].filter(Boolean).join(' / '),
        sdg_campaign: lead.utm?.utmCampaign || undefined,
        sdg_score: lead.score ?? undefined,
        sdg_band: lead.band || undefined,
      }
    : {}
  return clean({ ...base, ...sdg }) as Record<string, string | number>
}

let propertiesReady: Promise<boolean> | null = null

/** Creates the SDG contact properties once per process; false when the token lacks the schema scope. */
export function ensureProperties(): Promise<boolean> {
  propertiesReady ||= (async () => {
    try {
      const probe = await fetch(`${api()}/crm/v3/properties/contacts/${SDG_PROPERTIES[0].name}`, { headers: headers() })
      if (probe.ok) return true
      if (probe.status !== 404) return false
      const res = await fetch(`${api()}/crm/v3/properties/contacts/batch/create`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ inputs: SDG_PROPERTIES.map((p) => ({ ...p, groupName: 'contactinformation' })) }),
      })
      return res.ok || res.status === 409
    } catch {
      return false
    }
  })()
  return propertiesReady
}

/** For tests: forget the cached property check. */
export function resetHubspotCache(): void {
  propertiesReady = null
}

async function findByPhone(mobile: string): Promise<string | undefined> {
  const res = await fetch(`${api()}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'phone', operator: 'EQ', value: mobile }] }], properties: ['phone'], limit: 1 }),
  })
  if (!res.ok) return undefined
  const json = (await res.json().catch(() => ({}))) as { results?: { id?: string }[] }
  return json.results?.[0]?.id ? String(json.results[0].id) : undefined
}

async function update(id: string, properties: Record<string, unknown>): Promise<string> {
  // Lifecycle stage only moves forward in HubSpot; an existing contact keeps whatever stage sales gave it.
  const { lifecyclestage: _stage, ...rest } = properties
  void _stage
  const res = await fetch(`${api()}/crm/v3/objects/contacts/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ properties: rest }) })
  if (!res.ok) throw new Error(`HubSpot update ${res.status}: ${await res.text()}`)
  return id
}

/** Creates or updates the contact for this mobile number and returns its ID (the contact is the lead). */
export async function createLead(lead: CrmLead): Promise<CrmResult> {
  const custom = await ensureProperties()
  const properties = mapContact(lead, custom)
  const existing = await findByPhone(lead.mobile)
  if (existing) {
    const id = await update(existing, properties)
    return { id, contactId: id }
  }
  const res = await fetch(`${api()}/crm/v3/objects/contacts`, { method: 'POST', headers: headers(), body: JSON.stringify({ properties }) })
  if (res.status === 409) {
    // Same email already on a contact: HubSpot names it in the message ("Existing ID: 123").
    const text = await res.text()
    const id = (text.match(/Existing ID:\s*(\d+)/) || [])[1]
    if (!id) throw new Error(`HubSpot 409: ${text}`)
    await update(id, properties)
    return { id, contactId: id }
  }
  if (!res.ok) throw new Error(`HubSpot ${res.status}: ${await res.text()}`)
  const json = (await res.json().catch(() => ({}))) as { id?: string }
  const id = String(json.id || '')
  return { id, contactId: id }
}
