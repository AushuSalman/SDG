import { createLead as hubspotCreate, hubspotConfigured } from './hubspot'
import type { CrmLead, CrmResult } from './lead'
import { createLead as propfloCreate, propfloConfigured } from './propflo'

export type CrmProvider = 'propflo' | 'hubspot'
export const CRM_LABEL: Record<CrmProvider, string> = { propflo: 'PropFlo', hubspot: 'HubSpot' }

/**
 * Which CRM receives website enquiries. PropFlo is SDG's CRM and wins when its credentials are present;
 * HubSpot (free tier) stands in on staging. CRM_PROVIDER forces one of the two.
 */
export function crmProvider(): CrmProvider | null {
  const forced = (process.env.CRM_PROVIDER || '').trim().toLowerCase()
  if (forced === 'propflo') return propfloConfigured() ? 'propflo' : null
  if (forced === 'hubspot') return hubspotConfigured() ? 'hubspot' : null
  if (propfloConfigured()) return 'propflo'
  if (hubspotConfigured()) return 'hubspot'
  return null
}

export const crmConfigured = (): boolean => crmProvider() !== null

export async function createLead(lead: CrmLead): Promise<CrmResult & { provider: CrmProvider }> {
  const provider = crmProvider()
  if (!provider) throw new Error('No CRM configured')
  const result = provider === 'propflo' ? await propfloCreate(lead) : await hubspotCreate(lead)
  return { ...result, provider }
}
