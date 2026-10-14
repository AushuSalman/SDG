import type { CollectionConfig } from 'payload'

import { BUSINESSES, ROLES, isStaff, isSuperAdmin } from '@/lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
    defaultColumns: ['email', 'name', 'role', 'business'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: isStaff,
    create: isSuperAdmin,
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'super-admin') return true
      return { id: { equals: req.user.id } }
    },
    delete: isSuperAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'sales',
      saveToJWT: true,
      options: ROLES.map((r) => ({ label: r.replace('-', ' '), value: r })),
      access: {
        update: ({ req }) => req.user?.role === 'super-admin',
      },
    },
    {
      name: 'business',
      type: 'select',
      saveToJWT: true,
      options: BUSINESSES.map((b) => ({ label: b, value: b })),
      admin: { description: 'Business-specific administrators are limited to this business.' },
    },
    { name: 'phone', type: 'text' },
  ],
}
