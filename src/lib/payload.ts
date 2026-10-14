import { getPayload, type Payload } from 'payload'

import config from '@payload-config'

/** One Payload instance per process. Safe to call from server components, route handlers and jobs. */
export async function getPayloadClient(): Promise<Payload> {
  return getPayload({ config })
}
