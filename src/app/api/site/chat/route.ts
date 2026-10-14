import { z } from 'zod'

import { runChat } from '@/lib/ai/chat'
import { errorResponse } from '@/lib/api'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // streaming answers; serverless hosts cap the default lower

const Body = z.object({
  sessionId: z.string().min(8).max(80),
  message: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) })).max(20).optional(),
  page: z.string().max(200).optional(),
  business: z.enum(['construction', 'paper', 'glass']).optional(),
  projectSlug: z.string().max(80).optional(),
  documentId: z.string().max(40).optional(),
})

/**
 * Streams NDJSON: first a {"meta"} line (kind, sources, facts), then {"delta"} lines, then {"done":true}.
 * The answer is post-checked in full before the first byte streams, so nothing unchecked reaches the visitor.
 */
export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json())
    const payload = await getPayloadClient()
    const result = await runChat(payload, body)
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
        send({ meta: { kind: result.kind, category: result.category, sources: result.sources, facts: result.facts || [], language: result.language } })
        const words = result.text.split(/(\s+)/)
        for (let i = 0; i < words.length; i += 3) {
          send({ delta: words.slice(i, i + 3).join('') })
          await new Promise((r) => setTimeout(r, 12))
        }
        send({ done: true })
        controller.close()
      },
    })
    return new Response(stream, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' } })
  } catch (err) {
    return errorResponse(err)
  }
}
