import type { Payload } from 'payload'

import { AI_MODE } from './bedrock'
import { cosine, embedText, mockKeywordScore } from './embed'

export type RetrievedChunk = { text: string; title: string; documentId: string; score: number }

/** Below this a chunk is noise: cosine on Titan embeddings when live, keyword overlap in mock mode. */
const MIN_SCORE = AI_MODE === 'live' ? 0.3 : 0.3
/** A chunk from the project the visitor is looking at outranks a general one. */
const PROJECT_BOOST = 0.25

type NativeCollection = {
  aggregate: (pipeline: unknown[]) => { toArray: () => Promise<Record<string, unknown>[]> }
}

/**
 * Retrieval over approved documents only. Uses Atlas Vector Search when the index exists
 * (ATLAS_VECTOR_INDEX, default "chunks_vector", on the "embedding" field); falls back to an
 * in-process cosine scan, which is fine for the few hundred chunks SDG will have at launch.
 */
export async function retrieveChunks(
  payload: Payload,
  opts: { query: string; business?: string; projectId?: string; k?: number },
): Promise<RetrievedChunk[]> {
  const k = opts.k ?? 6
  const vector = await embedText(opts.query)
  const businesses = opts.business ? [opts.business, 'group'] : undefined

  try {
    const model = (payload.db as unknown as { collections?: Record<string, { collection: NativeCollection }> }).collections?.['document-chunks']
    if (!model) throw new Error('no native collection')
    const filter: Record<string, unknown> = {}
    if (businesses) filter.business = { $in: businesses }
    const rows = await model.collection
      .aggregate([
        {
          $vectorSearch: {
            index: process.env.ATLAS_VECTOR_INDEX || 'chunks_vector',
            path: 'embedding',
            queryVector: vector,
            numCandidates: 100,
            limit: k,
            ...(Object.keys(filter).length ? { filter } : {}),
          },
        },
        { $project: { text: 1, title: 1, document: 1, project: 1, score: { $meta: 'vectorSearchScore' } } },
      ])
      .toArray()
    if (rows.length) {
      return rows
        .map((r) => ({
          text: String(r.text),
          title: String(r.title || ''),
          documentId: String(r.document),
          score: Number(r.score || 0) + (opts.projectId && String(r.project) === opts.projectId ? PROJECT_BOOST : 0),
        }))
        .sort((a, b) => b.score - a.score)
    }
  } catch {
    // Not on Atlas, or the index is not created yet: scan instead.
  }

  const { docs } = await payload.find({
    collection: 'document-chunks',
    overrideAccess: true,
    depth: 0,
    limit: 2000,
    pagination: false,
    where: businesses ? { business: { in: businesses } } : {},
  })
  return docs
    .map((d) => {
      const base =
        AI_MODE === 'live'
          ? Array.isArray(d.embedding) ? cosine(vector, d.embedding as number[]) : 0
          : mockKeywordScore(opts.query, d.text)
      return {
        text: d.text,
        title: d.title || '',
        documentId: typeof d.document === 'object' && d.document ? String(d.document.id) : String(d.document),
        score: base + (opts.projectId && d.project === opts.projectId ? PROJECT_BOOST : 0),
      }
    })
    .filter((c) => c.score > MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
