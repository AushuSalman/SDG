/** @vitest-environment node */
import { describe, expect, it } from 'vitest'

import { scoreEnquiry } from '@/lib/scoring'

describe('lead scoring (questionnaire Q17 weights)', () => {
  it('scores a verified, budgeted, near-term, visit-ready home buyer as hot', () => {
    const r = scoreEnquiry({ type: 'home', budgetBand: '2-4cr', timeline: '0-3m', purpose: 'end-use', visitReady: true, locationGiven: true, loanRequired: 'no', otpVerified: true })
    expect(r.band).toBe('hot')
    expect(r.score).toBeGreaterThanOrEqual(90)
    expect(r.reasons).toContain('Ready to visit')
  })

  it('scores an exploring, undisclosed-budget enquiry as cold', () => {
    const r = scoreEnquiry({ type: 'home', budgetBand: 'undisclosed', timeline: 'exploring', otpVerified: false })
    expect(r.band).toBe('cold')
    expect(r.score).toBeLessThan(40)
  })

  it('uses the trade rules for paper enquiries', () => {
    const r = scoreEnquiry({ type: 'paper-trade', quantityGiven: true, recurring: true, timeline: '0-3m', otpVerified: true, locationGiven: true })
    expect(r.band).toBe('hot')
    expect(r.reasons).toContain('Recurring requirement')
  })

  it('never exceeds 100 or drops below 0', () => {
    const max = scoreEnquiry({ type: 'home', budgetBand: '4cr-plus', timeline: '0-3m', purpose: 'end-use', visitReady: true, locationGiven: true, loanRequired: 'no', otpVerified: true })
    const min = scoreEnquiry({})
    expect(max.score).toBeLessThanOrEqual(100)
    expect(min.score).toBeGreaterThanOrEqual(0)
  })
})
