import type { CollectionConfig } from 'payload'

import { canSeeCustomers, isStaff } from '@/lib/access'

/** Sales consultants, allocated by enquiry type, project, location and availability (Q49). */
export const Consultants: CollectionConfig = {
  slug: 'consultants',
  admin: {
    useAsTitle: 'name',
    group: 'Relationships',
    defaultColumns: ['name', 'businesses', 'email', 'active'],
  },
  access: {
    read: isStaff,
    create: canSeeCustomers,
    update: canSeeCustomers,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { type: 'row', fields: [
      { name: 'email', type: 'email', required: true, admin: { description: 'Outlook mailbox used for bookings' } },
      { name: 'phone', type: 'text' },
    ] },
    {
      name: 'businesses',
      type: 'select',
      hasMany: true,
      required: true,
      options: ['construction', 'paper', 'glass'],
    },
    {
      name: 'enquiryTypes',
      type: 'select',
      hasMany: true,
      options: ['home', 'commercial', 'paper-trade', 'glass-supply', 'general'],
    },
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true },
    { name: 'locations', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    { type: 'row', fields: [
      { name: 'hoursFrom', type: 'text', defaultValue: '10:00' },
      { name: 'hoursTo', type: 'text', defaultValue: '18:00' },
      { name: 'active', type: 'checkbox', defaultValue: true },
    ] },
    { name: 'user', type: 'relationship', relationTo: 'users' },
  ],
}
