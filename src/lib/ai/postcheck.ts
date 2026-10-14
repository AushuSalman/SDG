/**
 * The last gate before an answer streams (SOW §6, questionnaire Q21): no figures, no availability,
 * no possession dates, no loan outcomes, no guarantees, no commitments on SDG's behalf.
 * Sentences that trip a rule are removed and the hand-off line is appended.
 */
const PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: 'currency-figure', re: /₹\s?[\d,.]+|\b(rs\.?|inr)\s?[\d,.]+|\b\d+(\.\d+)?\s?(lakhs?|crores?|cr)\b|\bper\s*sq\.?\s*ft\b/i },
  { flag: 'guarantee', re: /\b(guarantee\w*|assured|promise\w*|definitely will)\b/i },
  { flag: 'availability', re: /\b(is|are) (still )?available\b|\bunits? (are )?left\b|\bsold out\b|\bwe (will|can) (book|reserve|hold)\b/i },
  { flag: 'possession-date', re: /\b(possession|handover|completion) (is|will be|by|in) (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|20\d\d)/i },
  { flag: 'loan-outcome', re: /\bloan (is|will be|gets?) (approved|sanctioned)\b|\byou (will )?qualify for\b/i },
  { flag: 'discount', re: /\bdiscount\w*\b|\bspecial (offer|price)\b/i },
  { flag: 'legal-opinion', re: /\b(legally|the law says|litigation-free|no legal issues?)\b/i },
]

export const HANDOFF_LINE =
  'For pricing, availability, possession dates, legal or loan matters, an SDG consultant will confirm the details directly. I can arrange a call or a site visit.'

export function postCheck(answer: string): { text: string; flags: string[]; removed: number } {
  const sentences = (answer || '').split(/(?<=[.!?])\s+(?=[A-Z0-9₹"'(ऀ-ॿఀ-౿])/)
  const flags = new Set<string>()
  const kept: string[] = []
  for (const s of sentences) {
    const hit = PATTERNS.find((p) => p.re.test(s))
    if (hit) flags.add(hit.flag)
    else kept.push(s)
  }
  const removed = sentences.length - kept.length
  let text = kept.join(' ').trim()
  if (removed > 0 || !text) text = (text ? text + '\n\n' : '') + HANDOFF_LINE
  return { text, flags: [...flags], removed }
}
