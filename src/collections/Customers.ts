import type { CollectionConfig } from 'payload'

import { canSeeCustomers } from '@/lib/access'

/** One contact per phone number; every enquiry hangs off it (questionnaire Q4). */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'phone',
    group: 'Relationships',
    defaultColumns: ['phone', 'name', 'email', 'consent', 'createdAt'],
  },
  access: {
    read: canSeeCustomers,
    create: canSeeCustomers,
    update: canSeeCustomers,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    { name: 'phone', type: 'text', required: true, unique: true, index: true, admin: { description: 'E.164, e.g. +919000000000' } },
    { type: 'row', fields: [
      { name: 'name', type: 'text' },
      { name: 'email', type: 'email' },
    ] },
    { type: 'row', fields: [
      { name: 'consent', type: 'checkbox', defaultValue: false },
      { name: 'consentAt', type: 'date' },
    ] },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: ['construction', 'paper', 'glass'],
    },
    { name: 'propfloContactId', type: 'text', admin: { description: 'Contact ID in PropFlo once synced' } },
    { name: 'notes', type: 'textarea' },
  ],
}
