import type { CollectionConfig } from 'payload'

import { canEditContent } from '@/lib/access'

/** Open roles for the Careers page. Only active roles are shown publicly. */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'business', 'location', 'active'],
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
      { name: 'type', type: 'select', defaultValue: 'full-time', options: ['full-time', 'contract', 'internship'] },
    ] },
    { name: 'description', type: 'textarea' },
    { type: 'row', fields: [
      { name: 'active', type: 'checkbox', defaultValue: true },
      { name: 'sample', type: 'checkbox', defaultValue: false, admin: { description: 'Placeholder role for layout review; shows a "Sample" chip' } },
      { name: 'order', type: 'number', defaultValue: 100 },
    ] },
  ],
}
