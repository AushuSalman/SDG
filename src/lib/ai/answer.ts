import { AI_MODE, MODELS, converse, estimateTokens, type ChatTurn } from './bedrock'
import type { RetrievedChunk } from './retrieve'

const LANG_NAME: Record<string, string> = { en: 'English', te: 'Telugu', hi: 'Hindi', other: 'the visitor\'s language' }

export function systemPrompt(language: string): string {
  return [
    'You are the SDG consultant assistant for Suvarna Durga Group (SDG), Hyderabad: construction and realty, kraft paper manufacturing, and glass bottle recycling.',
    'Answer only from the SOURCES provided. If the sources do not cover the question, say you do not have approved information on that yet and offer to connect an SDG consultant.',
    'Never state or estimate prices, price per sq ft, discounts, payment plans, unit availability, possession or completion dates, RERA or legal positions, loan outcomes, or returns. Never make commitments on behalf of SDG.',
    'Be warm, concise and specific. Use short paragraphs. Mention the source title in brackets after facts, like [Prinia fact sheet].',
    `Reply in ${LANG_NAME[language] || 'English'}.`,
  ].join(' ')
}

export async function draftAnswer(opts: {
  question: string
  history: ChatTurn[]
  chunks: RetrievedChunk[]
  language: string
}): Promise<{ text: string; model: string; tokens: number }> {
  const sources = opts.chunks
    .map((c, i) => `SOURCE ${i + 1} [${c.title || 'Approved document'}]\n${c.text}`)
    .join('\n\n')

  if (AI_MODE !== 'live') {
    if (!opts.chunks.length) {
      return {
        text: 'I do not have approved information on that yet. An SDG consultant can help, and I can arrange a call or a site visit.',
        model: 'mock',
        tokens: 0,
      }
    }
    const lines = opts.chunks.slice(0, 2).map((c) => {
      const first = c.text.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
      return `${first} [${c.title || 'Approved document'}]`
    })
    const text = `Here is what SDG's approved documents say.\n\n${lines.join('\n\n')}\n\nWould you like to book a site visit or speak to a consultant?`
    return { text, model: 'mock', tokens: estimateTokens(sources + text) }
  }

  const turns: ChatTurn[] = [
    ...opts.history.slice(-6),
    { role: 'user', text: `SOURCES:\n${sources || '(none)'}\n\nQUESTION: ${opts.question}` },
  ]
  const res = await converse({ model: MODELS.answer, system: systemPrompt(opts.language), turns, maxTokens: 600 })
  return { text: res.text, model: MODELS.answer, tokens: res.inputTokens + res.outputTokens }
}
