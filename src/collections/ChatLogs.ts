import type { CollectionConfig } from 'payload'

import { hasRole } from '@/lib/access'

/** Every assistant conversation, visible only to authorised roles (questionnaire Q7, SOW §6). */
export const ChatLogs: CollectionConfig = {
  slug: 'chat-logs',
  admin: {
    useAsTitle: 'sessionId',
    group: 'Relationships',
    defaultColumns: ['sessionId', 'business', 'handoff', 'consultantNotified', 'updatedAt'],
  },
  access: {
    read: ({ req }) => hasRole(req.user, 'super-admin', 'management', 'sales', 'support'),
    create: () => false,
    update: ({ req }) => hasRole(req.user, 'super-admin', 'management', 'sales', 'support'),
    delete: ({ req }) => hasRole(req.user, 'super-admin'),
  },
  fields: [
    { name: 'sessionId', type: 'text', required: true, index: true },
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
      { name: 'handoff', type: 'checkbox', defaultValue: false },
      { name: 'handoffReason', type: 'text' },
      { name: 'consultantNotified', type: 'checkbox', defaultValue: false },
    ] },
    { name: 'pickedUpBy', type: 'relationship', relationTo: 'users', admin: { description: 'Staff member who picked this conversation up' } },
    { name: 'pickedUpNote', type: 'textarea' },
  ],
}
