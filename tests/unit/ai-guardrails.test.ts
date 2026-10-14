/** @vitest-environment node */
import { describe, expect, it } from 'vitest'

import { classifyByRules } from '@/lib/ai/classify'
import { chunkText } from '@/lib/ai/embed'
import { HANDOFF_LINE, postCheck } from '@/lib/ai/postcheck'

describe('restricted-subject classifier (SOW §6.1, Q20, Q21)', () => {
  it.each([
    ['What is the price per sq ft at Prinia?', 'pricing'],
    ['Any discount if I book this month?', 'discounts'],
    ['Are 3 BHK units still available?', 'availability'],
    ['When is possession?', 'possession'],
    ['Is the RERA approval done?', 'rera-legal'],
    ['Can I get a home loan from SBI?', 'loans'],
    ['What returns can I expect on this investment?', 'returns'],
  ])('flags "%s" as %s', (q, category) => {
    const c = classifyByRules(q)
    expect(c.restricted).toBe(true)
    expect(c.category).toBe(category)
  })

  it('lets factual questions through', () => {
    const c = classifyByRules('What configurations does Prinia have?')
    expect(c.restricted).toBe(false)
    expect(c.business).toBe('construction')
  })

  it('detects Telugu and Hindi', () => {
    expect(classifyByRules('ప్రినియా ఎక్కడ ఉంది?').language).toBe('te')
    expect(classifyByRules('प्रिनिया कहाँ है?').language).toBe('hi')
  })
})

describe('post-check on drafted answers', () => {
  it('removes a price sentence and appends the hand-off line', () => {
    const r = postCheck('Prinia has 344 homes across two towers. A 3 BHK costs ₹2.1 crore. Site visits run Monday to Saturday.')
    expect(r.flags).toContain('currency-figure')
    expect(r.text).not.toContain('₹')
    expect(r.text).toContain('344 homes')
    expect(r.text).toContain(HANDOFF_LINE)
  })

  it('blocks guarantees and availability promises', () => {
    const r = postCheck('We guarantee 12% appreciation. Units are still available, we will book one for you.')
    expect(r.flags).toEqual(expect.arrayContaining(['guarantee', 'availability']))
    expect(r.removed).toBe(2)
  })

  it('leaves a clean answer untouched', () => {
    const text = 'Centrum is a completed office development at Golden Mile, Kokapet [Centrum fact sheet].'
    expect(postCheck(text)).toEqual({ text, flags: [], removed: 0 })
  })
})

describe('chunking', () => {
  it('keeps short paragraphs together and splits long ones with overlap', () => {
    const para = 'word '.repeat(300).trim()
    const chunks = chunkText(`Intro paragraph.\n\n${para}\n\nOutro.`, 500, 100)
    expect(chunks.length).toBeGreaterThan(2)
    expect(chunks[0]).toBe('Intro paragraph.')
    expect(chunks.every((c) => c.length <= 500)).toBe(true)
  })
})
