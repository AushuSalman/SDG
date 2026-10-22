import type { CollectionConfig } from 'payload'

import { hasRole } from '@/lib/access'

/** Every assistant conversation, visible only to authorised roles (questionnaire Q7, SOW §6). */
export const ChatLogs: CollectionConfig = {
  slug: 'chat-logs',
  labels: { singular: 'AI conversation', plural: 'AI conversations' },
  admin: {
    useAsTitle: 'sessionId',
    group: 'Enquiries & customers',
    description: 'Conversations with the AI assistant. Handoff marks the ones where a consultant was asked to take over.',
    defaultColumns: ['sessionId', 'business', 'handoff', 'consultantNotified', 'updatedAt'],
    listSearchableFields: ['sessionId', 'handoffReason', 'page'],
  },
  access: {
    read: ({ req }) => hasRole(req.user, 'super-admin', 'management', 'sales', 'support'),
    create: () => false,
    update: ({ req }) => hasRole(req.user, 'super-admin', 'management', 'sales', 'support'),
    delete: ({ req }) => hasRole(req.user, 'super-admin'),
  },
  fields: [
    { name: 'sessionId', type: 'text', label: 'Session ID', required: true, index: true },
    { type: 'row', fields: [
      { name: 'business', type: 'select', options: ['group', 'construction', 'paper', 'glass'] },
      { name: 'page', type: 'text' },
      { name: 'language', type: 'text', defaultValue: 'en' },
    ] },
    { name: 'customer', type: 'relationship', relationTo: 'customers' },
    { name: 'enquiry', type: 'relationship', relationTo: 'enquiries' },
    {
      name: 'messages',
      type: 'array',
      fields: [
        { type: 'row', fields: [
          { name: 'role', type: 'select', required: true, options: ['user', 'assistant'] },
          { name: 'restricted', type: 'checkbox', defaultValue: false },
          { name: 'category', type: 'text' },
          { name: 'model', type: 'text' },
        ] },
        { name: 'content', type: 'textarea', required: true },
        { name: 'sources', type: 'array', fields: [
          { name: 'title', type: 'text' },
          { name: 'documentId', type: 'text' },
        ] },
        { name: 'flags', type: 'array', fields: [{ name: 'flag', type: 'text' }] },
      ],
    },
    { type: 'row', fields: [
      { name: 'handoff', type: 'checkbox', label: 'Handed off to sales', defaultValue: false },
      { name: 'handoffReason', type: 'text', label: 'Hand-off reason' },
      { name: 'consultantNotified', type: 'checkbox', label: 'Consultant notified', defaultValue: false },
    ] },
    { name: 'pickedUpBy', type: 'relationship', relationTo: 'users', label: 'Picked up by', admin: { description: 'Staff member who picked this conversation up' } },
    { name: 'pickedUpNote', type: 'textarea', label: 'Pick-up note' },
  ],
}
