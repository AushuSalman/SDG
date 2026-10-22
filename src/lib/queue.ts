import { after } from 'next/server'
import type { Payload } from 'payload'

/**
 * Drains the job queue right after the current response on hosts with no always-on process (Vercel staging),
 * where the only other trigger is a once-a-day cron. On Lightsail and Render the queue runs every minute on
 * its own, so this is a no-op there. Outside a request (seed, scripts) `after` throws and the cron takes over.
 */
export function runQueueSoon(payload: Payload): void {
  if (!process.env.VERCEL) return
  try {
    after(async () => {
      try {
        await payload.jobs.run({ limit: 20 })
      } catch (err) {
        payload.logger.warn(`Queue run after response failed: ${String(err)}`)
      }
    })
  } catch {
    // Not inside a request: the scheduled cron will process the queue.
  }
}
