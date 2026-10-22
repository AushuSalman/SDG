import type { ServerProps, StaticLabel, VisibleEntities } from 'payload'

import { type EntityToGroup, EntityType, groupNavItems } from '@payloadcms/ui/shared'
import { formatAdminURL } from 'payload/shared'
import React from 'react'

import type { User } from '@/payload-types'

import { AdminNavClient, type IconName, type NavSection } from './AdminNavClient'

type Props = ServerProps & { visibleEntities: VisibleEntities }

/** Which TailAdmin icon each collection gets in the sidebar. Anything unlisted falls back to a page icon. */
const ICON_BY_SLUG: Record<string, IconName> = {
  projects: 'box-cube',
  posts: 'docs',
  jobs: 'task',
  testimonials: 'star',
  faqs: 'list',
  facts: 'check-circle',
  media: 'folder',
  leaders: 'user-circle',
  partners: 'box',
  'site-settings': 'plug-in',
  'site-copy': 'docs',
  enquiries: 'mail',
  customers: 'group',
  'chat-logs': 'chat',
  consultants: 'call',
  documents: 'file',
  users: 'user',
  'ai-usage': 'pie-chart',
}

const ROLE_LABEL: Record<User['role'], string> = {
  'super-admin': 'Super admin',
  management: 'Management',
  marketing: 'Marketing',
  sales: 'Sales',
  support: 'Support',
  'business-admin': 'Business admin',
}

const text = (label: StaticLabel, language: string): string => {
  if (typeof label === 'string') return label
  return label[language] ?? Object.values(label)[0] ?? ''
}

/**
 * The admin navigation, replacing Payload's default: TailAdmin's sidebar fed with the same grouped list of
 * collections and globals the signed-in user may see (so access control still decides what appears).
 */
export function AdminNav({ i18n, payload, permissions, user, visibleEntities }: Props) {
  const { collections, globals, routes } = payload.config
  const adminRoute = routes.admin

  const entities: EntityToGroup[] = [
    ...collections.filter(({ slug }) => visibleEntities.collections.includes(slug)).map((entity): EntityToGroup => ({ type: EntityType.collection, entity })),
    ...globals.filter(({ slug }) => visibleEntities.globals.includes(slug)).map((entity): EntityToGroup => ({ type: EntityType.global, entity })),
  ]
  const groups = groupNavItems(entities, permissions!, i18n)

  const sections: NavSection[] = groups.map((group) => ({
    label: group.label,
    items: group.entities.map(({ label, slug, type }) => ({
      slug,
      label: text(label, i18n.language),
      icon: ICON_BY_SLUG[slug] ?? 'page',
      href: formatAdminURL({ adminRoute, path: type === EntityType.collection ? `/collections/${slug}` : `/globals/${slug}` }),
    })),
  }))

  const me = user as User | undefined
  return (
    <AdminNavClient
      adminRoute={adminRoute}
      sections={sections}
      user={{ name: me?.name || me?.email || 'Staff', email: me?.email || '', role: me?.role ? ROLE_LABEL[me.role] : '' }}
    />
  )
}
