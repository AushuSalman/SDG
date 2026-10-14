import { createHash } from 'node:crypto'

import { AI_MODE, MODELS, invokeJson } from './bedrock'

export const EMBED_DIMENSIONS = AI_MODE === 'live' ? 512 : 128

const STOPWORDS = new Set(['the', 'and', 'for', 'are', 'with', 'that', 'this', 'from', 'you', 'your', 'what', 'which', 'does', 'have', 'has', 'can', 'will', 'our', 'its', 'per', 'sdg', 'group'])

/** Titan Text Embeddings v2 in Mumbai. Mock mode hashes words into a stable vector so dev works offline. */
export async function embedText(text: string): Promise<number[]> {
  if (AI_MODE === 'live') {
    const out = await invokeJson<{ embedding: number[] }>(MODELS.embed, {
      inputText: text.slice(0, 8000),
      dimensions: EMBED_DIMENSIONS,
      normalize: true,
    })
    return out.embedding
  }
  const v = new Array(EMBED_DIMENSIONS).fill(0)
  for (const word of text.toLowerCase().match(/[a-z0-9ऀ-ॿఀ-౿]+/g) || []) {
    if (word.length < 3 || STOPWORDS.has(word)) continue
    const h = createHash('md5').update(word).digest()
    const idx = h.readUInt16BE(0) % EMBED_DIMENSIONS
    v[idx] += 1 + (h[2] % 3) / 10
  }
  return normalize(v)
}

const tokens = (text: string): string[] =>
  (text.toLowerCase().match(/[a-z0-9ऀ-ॿఀ-౿]+/g) || []).filter((w) => w.length >= 3 && !STOPWORDS.has(w))

/** Offline relevance for mock mode: the share of question words that appear in the chunk. */
export function mockKeywordScore(query: string, text: string): number {
  const q = [...new Set(tokens(query))]
  if (!q.length) return 0
  const haystack = ' ' + tokens(text).join(' ') + ' '
  const hits = q.filter((w) => haystack.includes(' ' + w + ' ') || haystack.includes(' ' + w)).length
  return hits / q.length
}

export function normalize(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / n)
}

export function cosine(a: number[], b: number[]): number {
  let s = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) s += a[i] * b[i]
  return s
}

/** Split approved text into overlapping chunks that keep paragraphs together where possible. */
export function chunkText(text: string, size = 900, overlap = 150): string[] {
  const clean = (text || '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim()
  if (!clean) return []
  const paras = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let cur = ''
  for (const p of paras) {
    if ((cur + '\n\n' + p).length <= size) {
      cur = cur ? cur + '\n\n' + p : p
      continue
    }
    if (cur) chunks.push(cur)
    if (p.length <= size) {
      cur = p
    } else {
      let i = 0
      while (i < p.length) {
        chunks.push(p.slice(i, i + size))
        i += size - overlap
      }
      cur = ''
    }
  }
  if (cur) chunks.push(cur)
  return chunks
}
