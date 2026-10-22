import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

import { canEditContent, canPublish, publishedOrStaff } from '@/lib/access'
import { formatSlug } from '@/lib/slug'

/** Only Management or Super Admin may publish (SOW §6.3). Drafts are open to content roles. */
export const restrictPublish: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const publishing = data?._status === 'published' && originalDoc?._status !== 'published'
  // Internal calls (seed, jobs) carry no user; REST and admin calls always do, and access control already gates creation.
  if (publishing && req.user && !canPublish(req.user)) {
    throw new APIError('Only Management or a Super Admin can publish. Save as draft and request approval.', 403)
  }
  return data
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    useAsTitle: 'name',
    group: 'Website',
    description: 'Residential and commercial projects shown on the Construction and Real Estate pages. Save as a draft; Management or a Super Admin publishes.',
    defaultColumns: ['name', 'business', 'category', 'status', 'location', '_status'],
    listSearchableFields: ['name', 'location', 'rera'],
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrStaff,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  hooks: { beforeChange: [restrictPublish] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [formatSlug('name')] },
      admin: { position: 'sidebar', description: 'The address of the project page, e.g. sdg-prinia. Leave blank to make it from the name.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'business',
          type: 'select',
          required: true,
          defaultValue: 'construction',
          options: [
            { label: 'Construction', value: 'construction' },
            { label: 'Paper', value: 'paper' },
            { label: 'Glass recycling', value: 'glass' },
          ],
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { label: 'Residential', value: 'residential' },
            { label: 'Commercial', value: 'commercial' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          // "Stage" in the admin so it is not confused with Payload's draft/published Status column.
          label: 'Stage',
          admin: { description: 'Ongoing, completed or upcoming' },
          options: [
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Completed', value: 'completed' },
            { label: 'Upcoming', value: 'upcoming' },
          ],
        },
      ],
    },
    { name: 'location', type: 'text', required: true, admin: { description: 'Short, e.g. Kismatpur' } },
    { name: 'address', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'rera', type: 'text', label: 'RERA number' },
        { name: 'possession', type: 'text', admin: { description: 'As per RERA, e.g. Sep 2030' } },
        {
          name: 'sdgRole',
          type: 'select',
          label: "SDG's role",
          options: [{ label: 'Developer', value: 'developer' }, { label: 'Partner', value: 'partner' }],
          defaultValue: 'developer',
          admin: { description: 'Shown on the project page as "SDG" or "SDG partner project"' },
        },
      ],
    },
    { name: 'tagline', type: 'text' },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    {
      name: 'specs',
      type: 'group',
      label: 'Specifications',
      fields: [
        { type: 'row', fields: [
          { name: 'towers', type: 'number' },
          { name: 'floors', type: 'text' },
          { name: 'units', type: 'number' },
        ] },
        { type: 'row', fields: [
          { name: 'saleableArea', type: 'text', admin: { description: 'e.g. 8.6 lakh sq ft' } },
          { name: 'floorPlate', type: 'text' },
          { name: 'floorHeight', type: 'text' },
        ] },
        { type: 'row', fields: [
          { name: 'certification', type: 'text', admin: { description: 'e.g. IGBC Platinum pre-certification' } },
          { name: 'parking', type: 'text' },
        ] },
      ],
    },
    {
      name: 'configurations',
      type: 'array',
      fields: [
        { type: 'row', fields: [
          { name: 'label', type: 'text', required: true },
          { name: 'sizeSqft', type: 'number' },
        ] },
      ],
    },
    { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Hero image', admin: { description: 'Used on project cards and at the top of the project page' } },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'floorPlans', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'brochure', type: 'relationship', relationTo: 'documents' },
    { name: 'videoUrl', type: 'text', label: 'Video URL', admin: { description: 'YouTube link from the SDG channel' } },
    {
      name: 'pricing',
      type: 'group',
      label: 'Indicative pricing',
      admin: { description: 'Indicative only. The AI assistant may quote these; everything else goes to sales.' },
      fields: [
        { type: 'row', fields: [
          { name: 'from', type: 'number', label: 'From (₹ lakh)', admin: { description: 'e.g. 180 for ₹1.8 Cr' } },
          { name: 'to', type: 'number', label: 'To (₹ lakh)', admin: { description: 'e.g. 260 for ₹2.6 Cr' } },
        ] },
        { name: 'note', type: 'text', defaultValue: 'Indicative range. Confirmed by an SDG consultant.' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Featured projects come first on the Construction page and in the Featured sort' } },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    {
      name: 'seo',
      type: 'group',
      label: 'Search listing (SEO)',
      fields: [
        { name: 'title', type: 'text', label: 'Page title', admin: { description: 'Optional; the project name is used when blank' } },
        { name: 'description', type: 'textarea', label: 'Search description', admin: { description: 'Shown under the link in Google; the summary is used when blank' } },
      ],
    },
  ],
}
