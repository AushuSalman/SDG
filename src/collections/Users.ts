import type { CollectionConfig } from 'payload'

import { BUSINESSES, type Business, ROLES, type Role, isStaff, isSuperAdmin } from '@/lib/access'

/** What staff see in the role and business pickers; the stored values stay the slugs. */
const ROLE_LABELS: Record<Role, string> = {
  'super-admin': 'Super admin',
  management: 'Management',
  marketing: 'Marketing',
  sales: 'Sales',
  support: 'Support',
  'business-admin': 'Business admin',
}
const BUSINESS_LABELS: Record<Business, string> = {
  construction: 'Construction',
  paper: 'Paper',
  glass: 'Glass recycling',
  agro: 'Agro products',
  group: 'Whole group',
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff user', plural: 'Staff users' },
  admin: {
    useAsTitle: 'email',
    group: 'Staff & system',
    description: 'Staff who can sign in here. The role decides what each person can see and publish.',
    defaultColumns: ['email', 'name', 'role', 'business'],
    listSearchableFields: ['email', 'name'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // The session cookie never travels over plain http in production (a production build served on plain
    // http://localhost, as in a local smoke test, is the one exception) and is not sent on cross-site requests.
    cookies: { secure: process.env.NODE_ENV === 'production' && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(process.env.NEXT_PUBLIC_SERVER_URL || ''), sameSite: 'Lax' },
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
      options: ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r })),
      access: {
        update: ({ req }) => req.user?.role === 'super-admin',
      },
    },
    {
      name: 'business',
      type: 'select',
      saveToJWT: true,
      options: BUSINESSES.map((b) => ({ label: BUSINESS_LABELS[b], value: b })),
      admin: { description: 'Business-specific administrators are limited to this business.' },
    },
    { name: 'phone', type: 'text' },
  ],
}
