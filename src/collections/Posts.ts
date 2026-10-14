import type { CollectionConfig } from 'payload'

import { canEditContent, publishedOrStaff } from '@/lib/access'
import { restrictPublish } from './Projects'

/** Insights: articles for the Blogs section. Drafts stay private until Management publishes. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'business', 'publishedAt', '_status'],
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
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { type: 'row', fields: [
      { name: 'business', type: 'select', defaultValue: 'group', options: ['group', 'construction', 'paper', 'glass'] },
      { name: 'readMinutes', type: 'number', defaultValue: 4, admin: { description: 'Reading time shown on the card' } },
      { name: 'publishedAt', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    ] },
    { name: 'excerpt', type: 'textarea', required: true, admin: { description: 'One or two sentences for the card and search results' } },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'body', type: 'richText' },
    {
      name: 'sample',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Placeholder content for layout review. Shows a "Sample" chip on the site until it is unticked.' },
    },
  ],
}
