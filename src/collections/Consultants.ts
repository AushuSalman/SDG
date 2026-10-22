import type { CollectionConfig } from 'payload'

import { canSeeCustomers, isStaff } from '@/lib/access'

/** Sales consultants, allocated by enquiry type, project, location and availability (Q49). */
export const Consultants: CollectionConfig = {
  slug: 'consultants',
  labels: { singular: 'Sales consultant', plural: 'Sales consultants' },
  admin: {
    useAsTitle: 'name',
    group: 'Enquiries & customers',
    description: 'Sales consultants who receive enquiries and visit bookings, per business.',
    defaultColumns: ['name', 'businesses', 'email', 'active'],
    listSearchableFields: ['name', 'email', 'phone'],
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
      label: 'Enquiry types',
      hasMany: true,
      options: ['home', 'commercial', 'paper-trade', 'glass-supply', 'general'],
    },
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true },
    { name: 'locations', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    { type: 'row', fields: [
      { name: 'hoursFrom', type: 'text', label: 'Available from', defaultValue: '10:00', admin: { description: 'Meeting slots on the scheduler run hourly between these times' } },
      { name: 'hoursTo', type: 'text', label: 'Available until', defaultValue: '18:00' },
      { name: 'active', type: 'checkbox', defaultValue: true },
    ] },
    { name: 'user', type: 'relationship', relationTo: 'users', label: 'Staff login', admin: { description: 'The admin account of this consultant, if they have one' } },
    {
      name: 'calendar',
      type: 'group',
      label: 'Outlook calendar',
      admin: { description: 'Connect this consultant\'s Microsoft 365 or Outlook.com calendar: confirmed meeting requests are booked on it and the scheduler greys out slots that are already taken.' },
      fields: [
        { name: 'connect', type: 'ui', admin: { components: { Field: '/components/admin/CalendarConnect#CalendarConnect' } } },
        { type: 'row', fields: [
          { name: 'connectedAs', type: 'text', label: 'Connected as', admin: { readOnly: true } },
          { name: 'connectedAt', type: 'date', label: 'Connected at', admin: { readOnly: true } },
        ] },
        // Never leaves the server: hidden in the admin and unreadable through the API; jobs read it with overrideAccess.
        { name: 'refreshToken', type: 'text', admin: { hidden: true }, access: { read: () => false, update: () => false } },
      ],
    },
  ],
}
