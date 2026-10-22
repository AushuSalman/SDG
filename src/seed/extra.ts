/** Lexical rich-text helper for seeded paragraphs (project descriptions, posts). */

const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const para = (t: string) => ({ type: 'paragraph', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, textStyle: '', children: [text(t)] })
export const richText = (paras: string[]) => ({ root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children: paras.map(para) } })
