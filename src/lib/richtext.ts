/**
 * Tidies rich text that staff pasted as plain text (every line its own paragraph) into real structure, so the
 * article page gets headings, lists and bold instead of a wall of equal lines. Rules, in order:
 *
 * 1. A paragraph holding line breaks is split into one paragraph per line; blank paragraphs are dropped.
 * 2. "Key: value" lines at the very top (Author, Tags, Category, Reading time) leave the body and come back as
 *    meta for the post's own fields.
 * 3. "## Heading" markdown and a line that is entirely **bold** become headings (h2 to h4); inline **bold**
 *    becomes bold text.
 * 4. Consecutive lines starting with "- ", "* ", "• " or "1." become one bullet or numbered list. A numbered line on
 *    its own ("1. What is cullet?") is a numbered heading, not a one-item list.
 * 5. Only while the body has no headings at all: a short line without end punctuation (a question mark is fine)
 *    that introduces more text becomes an h2.
 *
 * Structure the editor already holds (headings, lists, links, uploads) is kept, so running the tidy on its own
 * output changes nothing.
 */

export type LexicalNode = {
  type: string
  version?: number
  children?: LexicalNode[]
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  [k: string]: unknown
}
export type RichTextDoc = { root: LexicalNode & { children: LexicalNode[] }; [k: string]: unknown }
export type BodyMeta = { author?: string; tags?: string; readMinutes?: number }

const BLOCK = { format: '', indent: 0, version: 1, direction: 'ltr' } as const
const text = (t: string, format = 0): LexicalNode => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })
const paragraph = (children: LexicalNode[]): LexicalNode => ({ type: 'paragraph', ...BLOCK, textFormat: 0, textStyle: '', children })
const heading = (tag: 'h2' | 'h3' | 'h4', children: LexicalNode[]): LexicalNode => ({ type: 'heading', ...BLOCK, tag, children })
const list = (listType: 'bullet' | 'number', items: LexicalNode[][]): LexicalNode => ({
  type: 'list',
  ...BLOCK,
  listType,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  start: 1,
  children: items.map((children, i) => ({ type: 'listitem', ...BLOCK, value: i + 1, children })),
})

/** The visible text of a node tree; line breaks become newlines. */
export const plainText = (node: LexicalNode): string =>
  node.type === 'text' ? node.text || '' : node.type === 'linebreak' ? '\n' : (node.children || []).map(plainText).join('')

const onlyText = (node: LexicalNode) => (node.children || []).every((c) => c.type === 'text' || c.type === 'linebreak')
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

/** Splits a paragraph on its line breaks; a paragraph with none comes back as itself. */
const splitLines = (node: LexicalNode): LexicalNode[] => {
  if (node.type !== 'paragraph' || !(node.children || []).some((c) => c.type === 'linebreak')) return [node]
  const runs: LexicalNode[][] = [[]]
  for (const c of node.children || []) {
    if (c.type === 'linebreak') runs.push([])
    else runs[runs.length - 1].push(c)
  }
  return runs.filter((children) => children.length > 0).map((children) => ({ ...node, children }))
}

const isBlank = (node: LexicalNode) => node.type === 'paragraph' && onlyText(node) && plainText(node).trim() === ''

/** "Author: Editorial Team" style lines that belong in fields, not in the body. */
const META_RE = /^\s*(author|by|written by|tags?|keywords?|categor(?:y|ies)|reading time|read time)\s*[:：]\s*(.+?)\s*$/i

const parseMeta = (line: string, meta: BodyMeta): boolean => {
  const m = META_RE.exec(line)
  if (!m) return false
  const key = m[1].toLowerCase()
  const value = m[2].trim()
  if (/^(author|by|written by)$/.test(key)) {
    meta.author = meta.author || value
  } else if (/time$/.test(key)) {
    const n = parseInt(value, 10)
    if (n > 0) meta.readMinutes = n
  } else {
    const have = (meta.tags || '').split(',').map((s) => s.trim()).filter(Boolean)
    const parts = value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    meta.tags = [...have, ...parts.filter((p) => !have.some((h) => h.toLowerCase() === p.toLowerCase()))].join(', ')
  }
  return true
}

/** Turns "**bold**" markers into bold text runs; text without markers comes back as one run. */
const inline = (t: string): LexicalNode[] => {
  const out: LexicalNode[] = []
  const re = /\*\*([^*]+?)\*\*/g
  let last = 0
  for (let m = re.exec(t); m; m = re.exec(t)) {
    if (m.index > last) out.push(text(t.slice(last, m.index)))
    out.push(text(m[1], 1))
    last = m.index + m[0].length
  }
  if (last < t.length) out.push(text(t.slice(last)))
  return out.length ? out : [text('')]
}

const MD_HEADING = /^\s*(#{1,6})\s+(.+?)\s*$/
const BOLD_LINE = /^\s*\*\*([^*]+?)\*\*\s*:?\s*$/
const BULLET = /^\s*[-–—*•·]\s+(.+?)\s*$/
const NUMBERED = /^\s*(?:\d{1,3}[.)]|\(\d{1,3}\))\s+(.+?)\s*$/

type Item = { kind: 'bullet' | 'number'; children: LexicalNode[]; source: LexicalNode }
type Piece = { node: LexicalNode } | { item: Item }

const convertParagraph = (node: LexicalNode): Piece => {
  if (!onlyText(node)) return { node }
  const t = plainText(node)
  let m = MD_HEADING.exec(t)
  if (m) return { node: heading(m[1].length <= 2 ? 'h2' : m[1].length === 3 ? 'h3' : 'h4', inline(m[2])) }
  m = BOLD_LINE.exec(t)
  if (m && words(m[1]) <= 12) return { node: heading('h3', [text(m[1])]) }
  m = BULLET.exec(t)
  if (m) return { item: { kind: 'bullet', children: inline(m[1]), source: node } }
  m = NUMBERED.exec(t)
  if (m) return { item: { kind: 'number', children: inline(m[1]), source: node } }
  if (t.includes('**')) return { node: paragraph(inline(t)) }
  return { node }
}

/** A short line without end punctuation, starting with a capital or digit: "Why glass matters", "Conclusion", "What is cullet?". */
const looksLikeHeading = (t: string): boolean => {
  const s = t.trim()
  return s.length > 0 && s.length <= 70 && words(s) <= 10 && /[A-Za-z]/.test(s) && !/[.!,;:]$/.test(s) && /^[A-Z0-9"“]/.test(s)
}

/**
 * Consecutive list items of one kind become a single list node. A numbered line on its own is not a list: it is a
 * numbered heading ("1. What is cullet?") when it reads like one, otherwise the paragraph it was.
 */
const assemble = (pieces: Piece[]): LexicalNode[] => {
  const out: LexicalNode[] = []
  let run: Item[] = []
  const flush = () => {
    if (run.length === 1 && run[0].kind === 'number') {
      const { source } = run[0]
      out.push(looksLikeHeading(plainText(source)) ? heading('h3', source.children || []) : source)
    } else if (run.length) {
      out.push(list(run[0].kind, run.map((r) => r.children)))
    }
    run = []
  }
  for (const p of pieces) {
    if ('item' in p) {
      if (run.length && run[0].kind !== p.item.kind) flush()
      run.push(p.item)
    } else {
      flush()
      out.push(p.node)
    }
  }
  flush()
  return out
}

/** Promotes introducing lines to h2, never two in a row; skipped when the author already placed headings. */
const promoteHeadings = (blocks: LexicalNode[], authored: boolean): LexicalNode[] => {
  if (authored) return blocks
  const out: LexicalNode[] = []
  blocks.forEach((b, i) => {
    const next = blocks[i + 1]
    const prev = out[out.length - 1]
    const introduces = next && (next.type === 'paragraph' || next.type === 'list' || (next.type === 'heading' && next.tag !== 'h2'))
    const eligible = b.type === 'paragraph' && onlyText(b) && introduces && prev?.type !== 'heading'
    out.push(eligible && looksLikeHeading(plainText(b)) ? heading('h2', b.children || []) : b)
  })
  return out
}

/** Headings start at h2 under the post title: when the body's highest level is h3 or h4, every heading moves up. */
function liftHeadings(blocks: LexicalNode[]): LexicalNode[] {
  const level = (b: LexicalNode) => Number(String(b.tag || 'h2').slice(1)) || 2
  const levels = blocks.filter((b) => b.type === 'heading').map(level)
  const shift = levels.length ? Math.min(...levels) - 2 : 0
  if (shift <= 0) return blocks
  return blocks.map((b) => (b.type === 'heading' ? { ...b, tag: `h${Math.max(2, level(b) - shift)}` as 'h2' | 'h3' | 'h4' } : b))
}

export function tidyRichText(doc: RichTextDoc): { doc: RichTextDoc; meta: BodyMeta; changed: boolean } {
  const meta: BodyMeta = {}
  if (!doc || !doc.root || !Array.isArray(doc.root.children)) return { doc, meta, changed: false }
  const lines = doc.root.children.flatMap(splitLines).filter((n) => !isBlank(n))
  let i = 0
  while (i < lines.length && lines[i].type === 'paragraph' && onlyText(lines[i]) && parseMeta(plainText(lines[i]), meta)) i++
  const pieces: Piece[] = lines.slice(i).map((n) => (n.type === 'paragraph' ? convertParagraph(n) : { node: n }))
  const authored = doc.root.children.some((n) => n.type === 'heading')
  const blocks = liftHeadings(promoteHeadings(assemble(pieces), authored))
  const next: RichTextDoc = { ...doc, root: { ...doc.root, children: blocks } }
  const changed = JSON.stringify(next) !== JSON.stringify(doc)
  return { doc: changed ? next : doc, meta, changed }
}

/** Comma-separated tags as a clean list. */
export const tagList = (tags: string | null | undefined): string[] => (tags || '').split(',').map((s) => s.trim()).filter(Boolean)
