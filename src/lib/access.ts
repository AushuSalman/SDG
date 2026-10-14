import type { Access } from 'payload'

/** The six staff roles from the SDG questionnaire (Q7). */
export const ROLES = [
  'super-admin',
  'management',
  'marketing',
  'sales',
  'support',
  'business-admin',
] as const
export type Role = (typeof ROLES)[number]

export const BUSINESSES = ['construction', 'paper', 'glass', 'group'] as const
export type Business = (typeof BUSINESSES)[number]

type StaffUser = { role?: Role | null; business?: Business | null } | null | undefined

export const hasRole = (user: StaffUser, ...roles: Role[]): boolean =>
  !!user && !!user.role && roles.includes(user.role)

/** Anyone logged into the admin panel. */
export const isStaff: Access = ({ req }) => Boolean(req.user)

export const isSuperAdmin: Access = ({ req }) => hasRole(req.user as StaffUser, 'super-admin')

/** Who may move a document from draft to published (SOW §6.3, questionnaire Q38: Akshay approves). */
export const canPublish = (user: StaffUser): boolean => hasRole(user, 'super-admin', 'management')

/** Customer data and conversations: only the roles the client named (Q7). */
export const canSeeCustomers: Access = ({ req }) =>
  hasRole(req.user as StaffUser, 'super-admin', 'management', 'sales', 'support')

export const canEditContent: Access = ({ req }) =>
  hasRole(req.user as StaffUser, 'super-admin', 'management', 'marketing', 'business-admin')

/** Public visitors only see published versions; staff see everything. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const nobody: Access = () => false
