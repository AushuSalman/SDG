import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes, SerializedAutoLinkNode, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import React from 'react'

import { safeHref } from '@/lib/validate'

type Props = { data: React.ComponentProps<typeof RichText>['data']; className?: string }

/** A link node as `<a>`: only web, mail and phone addresses survive as href; anything else becomes "#". */
const link = ({ node, nodesToJSX }: { node: SerializedAutoLinkNode | SerializedLinkNode; nodesToJSX: (args: { nodes: SerializedLinkNode['children'] }) => React.ReactNode }) => {
  const fields = node.fields as { url?: string; newTab?: boolean; linkType?: string }
  const href = fields.linkType === 'internal' ? '#' : safeHref(fields.url)
  const newTab = Boolean(fields.newTab)
  return (
    <a href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>
      {nodesToJSX({ nodes: node.children })}
    </a>
  )
}

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({ ...defaultConverters, link, autolink: link })

/**
 * Rich text from the admin (post bodies, project descriptions) rendered with link addresses checked, so a
 * compromised staff account cannot plant a javascript: link on the public site.
 */
export function SafeRichText({ data, className }: Props) {
  return <RichText data={data} converters={converters} className={className} />
}
