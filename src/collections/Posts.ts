import type { CollectionConfig } from 'payload'

import { canEditContent, publishedOrStaff } from '@/lib/access'
import { formatSlug } from '@/lib/slug'
import { restrictPublish } from './Projects'

/** Insights: articles for the Blogs section. Drafts stay private until Management publishes. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post or news item', plural: 'News & blog posts' },
  admin: {
    useAsTitle: 'title',
    group: 'Website',
    description: 'Articles and press coverage for the News & Blogs page. A post with an external link opens the publication instead of a page here. A draft stays hidden until it is published.',
    defaultColumns: ['title', 'business', 'source', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'excerpt'],
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
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [formatSlug('title')] },
      admin: { description: 'The address of the article, e.g. handover-day. Leave blank to make it from the title.' },
    },
    { type: 'row', fields: [
      { name: 'business', type: 'select', defaultValue: 'group', options: ['group', 'construction', 'paper', 'glass', 'agro'] },
      { name: 'readMinutes', type: 'number', label: 'Reading time (minutes)', defaultValue: 4, admin: { description: 'Reading time shown on the card' } },
      { name: 'publishedAt', type: 'date', label: 'Published on', admin: { date: { pickerAppearance: 'dayOnly' } } },
    ] },
    { name: 'excerpt', type: 'textarea', required: true, admin: { description: 'One or two sentences for the card and search results' } },
    { type: 'row', fields: [
      { name: 'externalUrl', type: 'text', label: 'External article link', admin: { description: 'For press coverage: the card links to this address and no page is made here' } },
      { name: 'source', type: 'text', label: 'Publication', admin: { description: 'e.g. Deccan Chronicle; shown on the card for press coverage' } },
    ] },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Cover image' },
    { name: 'body', type: 'richText' },
    {
      name: 'sample',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Placeholder content for layout review. Shows a "Sample" chip on the site until it is unticked.' },
    },
  ],
}
