import type { CollectionConfig } from 'payload'

import { canEditContent, canPublish } from '@/lib/access'

/**
 * Approved documents are the only thing the AI assistant may answer from (questionnaire Q52).
 * Approving a document queues the indexing job that chunks, embeds and stores it for retrieval.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'kind', 'business', 'approved', 'indexStatus', 'chunkCount'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  upload: {
    filesRequiredOnCreate: false,
    mimeTypes: [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        const approving = data?.approved === true && originalDoc?.approved !== true
        if (approving) {
          if (req.user && !canPublish(req.user)) {
            throw new Error('Only Management or a Super Admin can approve a document for the assistant.')
          }
          data.approvedBy = data.approvedBy || req.user?.email
          data.approvedAt = data.approvedAt || new Date().toISOString()
        }
        if (data?.approved === false) data.indexStatus = 'not-approved'
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const textChanged = previousDoc?.extractedText !== doc.extractedText
        const approvedNow = doc.approved && (operation === 'create' || !previousDoc?.approved || textChanged)
        const unapprovedNow = !doc.approved && previousDoc?.approved
        if (approvedNow || unapprovedNow) {
          await req.payload.jobs.queue({
            task: 'indexDocument',
            input: { documentId: String(doc.id) },
          })
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { type: 'row', fields: [
      {
        name: 'kind',
        type: 'select',
        required: true,
        options: [
          { label: 'Project brochure', value: 'brochure' },
          { label: 'Approved fact sheet', value: 'fact-sheet' },
          { label: 'FAQ', value: 'faq' },
          { label: 'Specification', value: 'specification' },
          { label: 'Amenities', value: 'amenities' },
          { label: 'Company profile', value: 'company-profile' },
          { label: 'Business or product document', value: 'product' },
        ],
      },
      {
        name: 'business',
        type: 'select',
        defaultValue: 'group',
        options: ['group', 'construction', 'paper', 'glass'],
      },
      { name: 'project', type: 'relationship', relationTo: 'projects' },
    ] },
    {
      name: 'extractedText',
      type: 'textarea',
      admin: {
        description:
          'The text the assistant reads. Paste the brochure text here. PDF text extraction is a later step.',
      },
    },
    { name: 'approved', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { type: 'row', fields: [
      { name: 'approvedBy', type: 'text', admin: { readOnly: true } },
      { name: 'approvedAt', type: 'date', admin: { readOnly: true } },
    ] },
    {
      name: 'indexStatus',
      type: 'select',
      defaultValue: 'not-approved',
      admin: { position: 'sidebar', readOnly: true },
      options: ['not-approved', 'pending', 'indexed', 'failed'],
    },
    { name: 'chunkCount', type: 'number', admin: { position: 'sidebar', readOnly: true } },
    { name: 'indexError', type: 'text', admin: { readOnly: true } },
  ],
}

/** Hidden store for embedded chunks. Written by the indexing job, read by retrieval. */
export const DocumentChunks: CollectionConfig = {
  slug: 'document-chunks',
  admin: { hidden: true },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'document', type: 'relationship', relationTo: 'documents', required: true, index: true },
    { name: 'title', type: 'text' },
    { name: 'business', type: 'text', index: true },
    { name: 'project', type: 'text', index: true },
    { name: 'chunkIndex', type: 'number', required: true },
    { name: 'text', type: 'textarea', required: true },
    { name: 'embedding', type: 'json' },
  ],
}
