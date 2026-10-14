import type { CollectionConfig } from 'payload'

import { canEditContent, publishedOrStaff } from '@/lib/access'
import { restrictPublish } from './Projects'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    group: 'Content',
    defaultColumns: ['question', 'business', 'project', '_status'],
  },
  versions: { drafts: true },
  access: {
    read: publishedOrStaff,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  hooks: { beforeChange: [restrictPublish] },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
    { type: 'row', fields: [
      {
        name: 'business',
        type: 'select',
        defaultValue: 'construction',
        options: ['group', 'construction', 'paper', 'glass'],
      },
      { name: 'project', type: 'relationship', relationTo: 'projects' },
      { name: 'order', type: 'number', defaultValue: 100 },
    ] },
    {
      name: 'restricted',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tick if the answer touches price, availability, RERA, legal or loans. The assistant will hand these off rather than answer.' },
    },
  ],
}
