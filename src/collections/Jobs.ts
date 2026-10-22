import type { CollectionConfig } from 'payload'

import { canEditContent } from '@/lib/access'

/** Open roles for the Careers page. Only active roles are shown publicly. */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job opening', plural: 'Job openings' },
  admin: {
    useAsTitle: 'title',
    group: 'Website',
    description: 'Open roles listed on the Careers page. Untick Active to take a role down without deleting it.',
    defaultColumns: ['title', 'business', 'location', 'active'],
    listSearchableFields: ['title', 'location'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { active: { equals: true } }),
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { type: 'row', fields: [
      { name: 'business', type: 'select', required: true, defaultValue: 'construction', options: ['construction', 'paper', 'glass', 'group'] },
      { name: 'location', type: 'text', required: true },
      { name: 'type', type: 'select', label: 'Employment type', defaultValue: 'full-time', options: [{ label: 'Full-time', value: 'full-time' }, { label: 'Contract', value: 'contract' }, { label: 'Internship', value: 'internship' }] },
    ] },
    { name: 'description', type: 'textarea' },
    { type: 'row', fields: [
      { name: 'active', type: 'checkbox', defaultValue: true },
      { name: 'sample', type: 'checkbox', defaultValue: false, admin: { description: 'Placeholder role for layout review; shows a "Sample" chip' } },
      { name: 'order', type: 'number', defaultValue: 100 },
    ] },
  ],
}
