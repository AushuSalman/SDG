import { AI_MODE, MODELS, converse } from './bedrock'

/**
 * Restricted subjects from SOW §6.1 and questionnaire Q20/Q21. Rules run first and always, so the
 * guardrail holds even when the model is unavailable; the model only adds nuance for paraphrases.
 */
export type RestrictedCategory = 'pricing' | 'availability' | 'possession' | 'rera-legal' | 'loans' | 'returns' | 'discounts'

export type Classification = {
  restricted: boolean
  category?: RestrictedCategory
  intent: 'question' | 'visit' | 'contact' | 'other'
  business?: 'construction' | 'paper' | 'glass'
  language: 'en' | 'te' | 'hi' | 'other'
  byRule: boolean
}

const RULES: { category: RestrictedCategory; re: RegExp }[] = [
  { category: 'discounts', re: /\b(discount|offer price|special offer|deal|negotiat|cheaper|best price|lowest)/i },
  { category: 'pricing', re: /\b(price|pricing|cost|costs|rate|rates|per\s*sq\.?\s*ft|psf|sqft rate|lakh|crore|payment plan|booking amount|how much|what will it cost)\b|₹|\brs\.?\s?\d/i },
  { category: 'availability', re: /\b(availab\w*|vacant|unsold|sold out|units left|inventory|stock|reserve|block (a|the) (flat|unit)|hold (a|the) (flat|unit))\b/i },
  { category: 'possession', re: /\b(possession|handover|completion date|when (will|is) .*(ready|complete|done)|delivery date|move in)/i },
  { category: 'rera-legal', re: /\b(rera|legal|litigation|dispute|title deed|encumbrance|approval|sanction|court|agreement|contract terms|registration charges)\b/i },
  { category: 'loans', re: /\b(loan|emi|home finance|interest rate|bank approval|eligib\w*|sanction letter|down payment)\b/i },
  { category: 'returns', re: /\b(guarantee\w*|assured|returns?|roi|appreciation|rental yield|profit|resale value)\b/i },
]

export function classifyByRules(message: string): Classification {
  const text = message || ''
  const language: Classification['language'] = /[ఀ-౿]/.test(text)
    ? 'te'
    : /[ऀ-ॿ]/.test(text)
      ? 'hi'
      : 'en'
  let business: Classification['business']
  if (/\b(kraft|gsm|\bbf\b|paper|corrugat|reel|packaging)\b/i.test(text)) business = 'paper'
  else if (/\b(bottle|glass|cullet|recycl|distiller|brewer)\b/i.test(text)) business = 'glass'
  else if (/\b(flat|bhk|apartment|villa|office|tower|floor|project|prinia|premise|centrum|trilight|tech park|site visit)\b/i.test(text)) business = 'construction'

  const intent: Classification['intent'] = /\b(visit|see the (site|project)|come (over|by))\b/i.test(text)
    ? 'visit'
    : /\b(call me|contact|phone|whatsapp me|talk to (someone|sales|a person|human))\b/i.test(text)
      ? 'contact'
      : 'question'

  for (const rule of RULES) {
    if (rule.re.test(text)) return { restricted: true, category: rule.category, intent, business, language, byRule: true }
  }
  return { restricted: false, intent, business, language, byRule: true }
}

/** Rules, then a cheap Haiku pass for paraphrased restricted questions when live. */
export async function classify(message: string): Promise<Classification> {
  const base = classifyByRules(message)
  if (base.restricted || AI_MODE !== 'live') return base
  try {
    const { text } = await converse({
      model: MODELS.classify,
      maxTokens: 120,
      temperature: 0,
      system:
        'You classify visitor questions for a real-estate, paper and glass-recycling group in Hyderabad. ' +
        'Reply with JSON only: {"restricted": boolean, "category": one of pricing|availability|possession|rera-legal|loans|returns|discounts|null}. ' +
        'restricted is true if the question seeks a price, unit availability, possession or completion dates, RERA or legal matters, loans, discounts, or guaranteed returns, even if phrased indirectly.',
      turns: [{ role: 'user', text: message }],
    })
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as {
      restricted?: boolean
      category?: RestrictedCategory | null
    }
    if (json.restricted) return { ...base, restricted: true, category: json.category || 'pricing', byRule: false }
  } catch {
    // The rules result stands.
  }
  return base
}
