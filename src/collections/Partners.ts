import type { CollectionConfig } from 'payload'

import { canEditContent } from '@/lib/access'
import { isHttpUrl } from '@/lib/validate'

/** Partner categories and named partners on the Partnerships page, grouped by business. */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner or client', plural: 'Partners & clients' },
  admin: {
    useAsTitle: 'name',
    group: 'Website',
    description: 'Partners on the Partnerships page and the client logos on each business page, grouped by business. Untick Active to hide one.',
    defaultColumns: ['name', 'kind', 'business', 'summary', 'active', 'order'],
    listSearchableFields: ['name', 'summary'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { active: { equals: true } }),
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'A partner, a partner category (e.g. Home-loan partners) or a client' } },
    { type: 'row', fields: [
      {
        name: 'kind',
        type: 'select',
        required: true,
        defaultValue: 'partner',
        admin: { description: 'Partners appear on the Partnerships page; clients appear as a logo strip on their business page' },
        options: [
          { label: 'Partner', value: 'partner' },
          { label: 'Client or occupier', value: 'client' },
        ],
      },
      {
        name: 'business',
        type: 'select',
        required: true,
        defaultValue: 'construction',
        options: [
          { label: 'Construction', value: 'construction' },
          { label: 'Paper', value: 'paper' },
          { label: 'Glass recycling', value: 'glass' },
          { label: 'Agro products', value: 'agro' },
        ],
      },
      { name: 'summary', type: 'text', admin: { description: 'One line, e.g. Leading banks and HFCs' } },
    ] },
    { name: 'url', type: 'text', label: 'Website', validate: isHttpUrl, admin: { description: 'Optional link to the partner' } },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Shown beside the name on the Partnerships page and as the tile in a client logo strip' } },
    { type: 'row', fields: [
      { name: 'active', type: 'checkbox', defaultValue: true },
      { name: 'order', type: 'number', defaultValue: 100, admin: { description: 'Lower numbers come first within the business' } },
    ] },
  ],
}
