import type { CollectionConfig } from 'payload'

import { canEditContent, canPublish } from '@/lib/access'

/**
 * The master fact sheet, one row per claim. Mirrors the client's workbook: a fact is usable on the
 * website and by the AI assistant only when status is "approved".
 */
export const Facts: CollectionConfig = {
  slug: 'facts',
  labels: { singular: 'Approved fact', plural: 'Approved facts & numbers' },
  admin: {
    useAsTitle: 'claim',
    group: 'Website',
    description: 'Approved numbers and claims such as employees, years and built-up area. The site and the AI assistant quote only what is here.',
    defaultColumns: ['factId', 'category', 'claim', 'status', 'approvedBy'],
    listSearchableFields: ['claim', 'wording', 'factId'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'approved' } }),
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const approving = data?.status === 'approved' && originalDoc?.status !== 'approved'
        if (approving) {
          if (req.user && !canPublish(req.user)) {
            throw new Error('Only Management or a Super Admin can approve a fact.')
          }
          data.approvedBy = data.approvedBy || req.user?.email
          data.approvedAt = data.approvedAt || new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    { type: 'row', fields: [
      { name: 'factId', type: 'text', label: 'Fact ID', admin: { description: 'e.g. SDG-004' } },
      {
        name: 'category',
        type: 'select',
        required: true,
        options: [
          'Corporate Identity',
          'History & Timeline',
          'Business Verticals',
          'Group Metrics',
          'Leadership',
          'Realty',
          'Paper',
          'Bottle Recycling',
          'Agro Products',
          'CSR & Sustainability',
        ],
      },
      {
        name: 'business',
        type: 'select',
        defaultValue: 'group',
        options: ['group', 'construction', 'paper', 'glass', 'agro'],
      },
    ] },
    { name: 'claim', type: 'text', required: true, admin: { description: 'The field or claim, e.g. Employees' } },
    { name: 'wording', type: 'textarea', label: 'Public wording', required: true, admin: { description: 'Approved public wording' } },
    { name: 'value', type: 'text', label: 'Short value', admin: { description: 'Short value for stat tiles, e.g. 800+' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Approved · website ready', value: 'approved' },
        { label: 'Do not publish', value: 'do-not-publish' },
      ],
    },
    { type: 'row', fields: [
      { name: 'approvedBy', type: 'text' },
      { name: 'approvedAt', type: 'date' },
    ] },
    { name: 'source', type: 'text', admin: { description: 'Where it came from, e.g. Corporate presentation p.8' } },
    { name: 'showOnHome', type: 'checkbox', label: 'Show on home page', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
