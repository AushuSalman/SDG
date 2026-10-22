/** @vitest-environment node */
import { describe, expect, it } from 'vitest'

import { plainText, tagList, tidyRichText, type LexicalNode, type RichTextDoc } from '@/lib/richtext'

const text = (t: string, format = 0): LexicalNode => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })
const para = (...children: (string | LexicalNode)[]): LexicalNode => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, textStyle: '',
  children: children.map((c) => (typeof c === 'string' ? text(c) : c)),
})
const doc = (...children: LexicalNode[]): RichTextDoc => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } })
const types = (d: RichTextDoc) => d.root.children.map((c) => (c.type === 'heading' ? c.tag : c.type))

describe('tidyRichText', () => {
  it('moves the Author, Category, Tags and Reading time lines at the top into meta and out of the body', () => {
    const { doc: out, meta } = tidyRichText(doc(
      para('Category: Environment & Sustainability'), para('Author: Editorial Team'), para('Reading Time: 5–7 minutes'),
      para('Tags: Glass Recycling, Sustainability, Environment & Sustainability'), para('Glass recycling is an essential part of a cleaner future.'),
    ))
    expect(meta).toEqual({ author: 'Editorial Team', readMinutes: 5, tags: 'Environment & Sustainability, Glass Recycling, Sustainability' })
    expect(out.root.children).toHaveLength(1)
    expect(plainText(out.root.children[0])).toMatch(/^Glass recycling/)
  })

  it('turns runs of dashed and numbered lines into one list each', () => {
    const { doc: out } = tidyRichText(doc(
      para('Common recyclable glass items include:'), para('- Glass bottles used for beverages.'), para('• Food jars and sauce containers.'), para('* Cosmetic containers.'),
      para('Steps:'), para('1. Collect'), para('2) Sort'), para('Done.'),
    ))
    expect(types(out)).toEqual(['paragraph', 'list', 'paragraph', 'list', 'paragraph'])
    const [, bullets, , numbers] = out.root.children
    expect(bullets.listType).toBe('bullet')
    expect(bullets.children?.map(plainText)).toEqual(['Glass bottles used for beverages.', 'Food jars and sauce containers.', 'Cosmetic containers.'])
    expect(numbers.listType).toBe('number')
    expect(numbers.tag).toBe('ol')
    expect(numbers.children?.map((c) => c.value)).toEqual([1, 2])
  })

  it('reads markdown headings, whole-line bold headings and inline bold', () => {
    const { doc: out } = tidyRichText(doc(para('## Why it matters'), para('Because **every bottle** counts.'), para('### Sorting'), para('**The washing stage**'), para('Text.')))
    expect(types(out)).toEqual(['h2', 'paragraph', 'h3', 'h3', 'paragraph'])
    expect(plainText(out.root.children[0])).toBe('Why it matters')
    const runs = out.root.children[1].children || []
    expect(runs.map((r) => [r.text, r.format])).toEqual([['Because ', 0], ['every bottle', 1], [' counts.', 0]])
    expect(plainText(out.root.children[3])).toBe('The washing stage')
  })

  it('treats a numbered line on its own as a numbered heading or plain paragraph, never a one-item list', () => {
    const { doc: out } = tidyRichText(doc(
      para('Frequently asked questions'), para('1. Can glass be recycled indefinitely?'), para('Yes, without losing quality.'),
      para('2. What is cullet?'), para('Crushed recycled glass.'), para('1. Always handle broken glass carefully and follow local disposal instructions.'), para('The end.'),
    ))
    expect(types(out)).toEqual(['h2', 'h3', 'paragraph', 'h3', 'paragraph', 'paragraph', 'paragraph'])
    expect(plainText(out.root.children[1])).toBe('1. Can glass be recycled indefinitely?')
    expect(plainText(out.root.children[5])).toMatch(/^1\. Always/)
  })

  it('promotes short introducing lines to h2 only when the body has no headings, never two in a row', () => {
    const plain = doc(para('Introduction'), para('Glass is endlessly recyclable.'), para('Common items include:'), para('- Bottles'), para('Why does it matter?'), para('Recycle more.'), para('Every bottle counts'))
    const { doc: out } = tidyRichText(plain)
    expect(types(out)).toEqual(['h2', 'paragraph', 'paragraph', 'list', 'h2', 'paragraph', 'paragraph'])
    const styled = doc(para('Introduction'), para('Glass is endlessly recyclable.'), { type: 'heading', tag: 'h2', version: 1, children: [text('Already styled')] }, para('More.'))
    expect(types(tidyRichText(styled).doc)).toEqual(['paragraph', 'paragraph', 'h2', 'paragraph'])
  })

  it('splits paragraphs on line breaks and drops blank ones', () => {
    const { doc: out } = tidyRichText(doc(para('One', { type: 'linebreak', version: 1 }, 'Two.'), para('   '), para('Three.')))
    expect(out.root.children.map(plainText)).toEqual(['One', 'Two.', 'Three.'])
  })

  it('keeps uploads, links and other nodes, and changes nothing on a second pass', () => {
    const upload = { type: 'upload', version: 3, relationTo: 'media', value: 'abc', fields: null }
    const link = para(text('See '), { type: 'link', version: 3, fields: { url: 'https://sdg.in' }, children: [text('sdg.in')] })
    const first = tidyRichText(doc(para('Author: Team'), para('Overview'), para('- a'), para('- b'), upload, link, para('End.')))
    expect(first.changed).toBe(true)
    expect(types(first.doc)).toEqual(['h2', 'list', 'upload', 'paragraph', 'paragraph'])
    const second = tidyRichText(first.doc)
    expect(second.changed).toBe(false)
    expect(second.meta).toEqual({})
    expect(second.doc).toBe(first.doc)
  })

  it('leaves a body that is already structured alone', () => {
    const styled = doc({ type: 'heading', tag: 'h2', version: 1, children: [text('Title')] }, para('Body text.'), { type: 'list', listType: 'bullet', tag: 'ul', version: 1, children: [] })
    expect(tidyRichText(styled).changed).toBe(false)
  })
})

describe('tagList', () => {
  it('splits comma-separated tags and ignores blanks', () => {
    expect(tagList(' Glass Recycling, , Sustainability ')).toEqual(['Glass Recycling', 'Sustainability'])
    expect(tagList(null)).toEqual([])
  })
})
