/**
 * Rules-based lead qualification (SOW §8.1, questionnaire Q16/Q17).
 * Highest weight: budget, timeline, genuine intent, site-visit readiness. Then location, purpose, loan.
 * Rules decide; the AI may suggest values for the inputs but never the score.
 */
export type ScoreInput = {
  type?: string | null
  budgetBand?: string | null
  timeline?: string | null
  purpose?: string | null
  visitReady?: boolean | null
  locationGiven?: boolean
  loanRequired?: string | null
  otpVerified?: boolean | null
  quantityGiven?: boolean
  recurring?: boolean | null
}

export type Band = 'hot' | 'warm' | 'cold'
export type ScoreResult = { score: number; band: Band; reasons: string[] }

const BUDGET: Record<string, number> = { '4cr-plus': 25, '2-4cr': 25, '1-2cr': 20, 'under-1cr': 12, undisclosed: 5 }
const TIMELINE: Record<string, number> = { '0-3m': 25, '3-6m': 20, '6-12m': 12, '12m-plus': 6, exploring: 2 }
const PURPOSE: Record<string, number> = { 'end-use': 10, investment: 8, business: 8 }
const LOAN: Record<string, number> = { no: 5, yes: 4, unknown: 2 }

export const bandFor = (score: number): Band => (score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold')

export function scoreEnquiry(input: ScoreInput): ScoreResult {
  const reasons: string[] = []
  let score = 0
  const trade = input.type === 'paper-trade' || input.type === 'glass-supply'

  if (trade) {
    // Trade and supply enquiries: genuine business, defined quantity, recurring requirement, timeline, geography.
    if (input.quantityGiven) { score += 25; reasons.push('Quantity defined') }
    if (input.recurring) { score += 20; reasons.push('Recurring requirement') }
    const t = TIMELINE[input.timeline || ''] ?? 0
    score += t
    if (t >= 20) reasons.push('Near-term timeline')
    if (input.otpVerified) { score += 20; reasons.push('Verified contact') }
    if (input.locationGiven) { score += 10; reasons.push('Location given') }
  } else {
    const b = BUDGET[input.budgetBand || ''] ?? 0
    score += b
    if (b >= 20) reasons.push('Budget fits the portfolio')
    const t = TIMELINE[input.timeline || ''] ?? 0
    score += t
    if (t >= 20) reasons.push('Purchase within 6 months')
    const intent = (input.otpVerified ? 10 : 0) + (PURPOSE[input.purpose || ''] ?? 3)
    score += intent
    if (input.otpVerified) reasons.push('Verified contact')
    if (input.purpose) reasons.push(`Purpose: ${input.purpose}`)
    if (input.visitReady) { score += 20; reasons.push('Ready to visit') }
    if (input.locationGiven) { score += 5; reasons.push('Project or location preference given') }
    score += LOAN[input.loanRequired || 'unknown'] ?? 2
  }

  score = Math.max(0, Math.min(100, Math.round(score)))
  return { score, band: bandFor(score), reasons }
}
