import { APIError, type CollectionConfig } from 'payload'

import { canEditContent, canPublish } from '@/lib/access'

/** Social proof. Only approved quotes reach the site; approval needs Management or Super Admin, like Facts. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    useAsTitle: 'name',
    group: 'Website',
    description: 'Customer quotes shown on the site. Visitors only see the approved ones.',
    defaultColumns: ['name', 'business', 'approved', 'sample'],
    listSearchableFields: ['name', 'quote'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const approving = data?.approved === true && originalDoc?.approved !== true
        if (approving && req.user && !canPublish(req.user)) throw new APIError('Only Management or a Super Admin can approve testimonials for the site.', 403)
        if (approving) { data.approvedBy = req.user?.name || data.approvedBy; data.approvedAt = new Date().toISOString() }
        return data
      },
    ],
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { type: 'row', fields: [
      { name: 'name', type: 'text', required: true, admin: { description: 'e.g. Resident, or a name with permission' } },
      { name: 'role', type: 'text', label: 'Role or context', admin: { description: 'e.g. Centrum occupier, 2024' } },
      { name: 'business', type: 'select', defaultValue: 'construction', options: ['group', 'construction', 'paper', 'glass'] },
    ] },
    { type: 'row', fields: [
      { name: 'approved', type: 'checkbox', defaultValue: false },
      { name: 'sample', type: 'checkbox', defaultValue: false, admin: { description: 'Placeholder for layout review; shows a "Sample" chip' } },
      { name: 'order', type: 'number', defaultValue: 100 },
    ] },
    { name: 'approvedBy', type: 'text', admin: { readOnly: true } },
    { name: 'approvedAt', type: 'date', admin: { readOnly: true } },
  ],
}
