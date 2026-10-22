import type { FieldHook } from 'payload'

/** "Where a returned bottle goes " -> "where-a-returned-bottle-goes": lowercase, ASCII, hyphens, no stray spaces. */
export const slugify = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Field hook for `slug` fields: cleans whatever staff typed (a trailing space once broke a post's page) and,
 * when the slug is left blank, derives it from the given title field so non-technical editors need not fill it.
 */
export const formatSlug =
  (fromField: string): FieldHook =>
  ({ data, operation, siblingData, value }) => {
    const typed = typeof value === 'string' ? value.trim() : ''
    if (typed) return slugify(typed)
    if (operation === 'create' || operation === 'update') {
      const source = (siblingData?.[fromField] ?? data?.[fromField]) as unknown
      if (typeof source === 'string' && source.trim()) return slugify(source)
    }
    return value
  }
