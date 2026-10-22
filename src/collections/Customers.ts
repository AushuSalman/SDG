import type { CollectionConfig } from 'payload'

import { canSeeCustomers } from '@/lib/access'

/** One contact per phone number; every enquiry hangs off it (questionnaire Q4). */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Customer', plural: 'Customers' },
  admin: {
    useAsTitle: 'phone',
    group: 'Enquiries & customers',
    description: 'People who have enquired, booked a visit or used My Portal, identified by their mobile number.',
    defaultColumns: ['phone', 'name', 'email', 'consent', 'createdAt'],
    listSearchableFields: ['phone', 'name', 'email'],
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
      { name: 'consentAt', type: 'date', label: 'Consent given at' },
    ] },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: ['construction', 'paper', 'glass'],
    },
    { name: 'crmContactId', type: 'text', label: 'CRM contact ID', admin: { description: 'Contact ID in the CRM (PropFlo or HubSpot) once synced' } },
    { name: 'notes', type: 'textarea' },
  ],
}
