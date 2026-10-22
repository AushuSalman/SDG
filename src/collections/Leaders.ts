import type { CollectionConfig } from 'payload'

import { canEditContent } from '@/lib/access'

/** The people on the Leadership page. Visitors only see active profiles, in display order. */
export const Leaders: CollectionConfig = {
  slug: 'leaders',
  labels: { singular: 'Leader', plural: 'Leadership' },
  admin: {
    useAsTitle: 'name',
    group: 'Website',
    description: 'The people shown on the Leadership page, in display order. Untick Active to hide someone without deleting them.',
    defaultColumns: ['name', 'role', 'section', 'business', 'active', 'order'],
    listSearchableFields: ['name', 'role'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { active: { equals: true } }),
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'As it should appear on the site, e.g. Dr. J. Srinivasa Reddy' } },
    { type: 'row', fields: [
      { name: 'role', type: 'text', required: true, admin: { description: 'e.g. Managing Director' } },
      {
        name: 'business',
        type: 'select',
        defaultValue: 'group',
        options: [
          { label: 'Group', value: 'group' },
          { label: 'Construction', value: 'construction' },
          { label: 'Paper', value: 'paper' },
          { label: 'Glass recycling', value: 'glass' },
        ],
      },
    ] },
    { type: 'row', fields: [
      {
        name: 'section',
        type: 'select',
        defaultValue: 'leadership',
        admin: { description: 'Which block of the Leadership page the profile sits in' },
        options: [
          { label: 'The leadership', value: 'leadership' },
          { label: 'Management team', value: 'management' },
        ],
      },
      { name: 'qualifications', type: 'text', admin: { description: 'e.g. MBBS, MD, MBA (ISB)' } },
    ] },
    { name: 'bio', type: 'textarea', label: 'Short biography', admin: { description: 'Two or three sentences' } },
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Portrait, 4:5. Initials are shown until a photo is added.' } },
    { type: 'row', fields: [
      { name: 'active', type: 'checkbox', defaultValue: true },
      { name: 'order', type: 'number', defaultValue: 100, admin: { description: 'Lower numbers come first' } },
    ] },
  ],
}
