import type { CollectionConfig } from 'payload'

import { hasRole } from '@/lib/access'

/** One row per month: tokens used by the assistant, checked against the cap in Site Settings. */
export const AiUsage: CollectionConfig = {
  slug: 'ai-usage',
  labels: { singular: 'AI usage', plural: 'AI usage' },
  admin: { group: 'Staff & system', useAsTitle: 'month', defaultColumns: ['month', 'tokens'], description: 'Monthly AI token usage against the budget set in Site settings.' },
  access: {
    read: ({ req }) => hasRole(req.user, 'super-admin', 'management'),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'month', type: 'text', required: true, unique: true, index: true },
    { name: 'tokens', type: 'number', required: true, defaultValue: 0 },
    { name: 'alerted', type: 'checkbox', defaultValue: false },
  ],
}
