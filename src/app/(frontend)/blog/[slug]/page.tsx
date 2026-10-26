import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { SafeRichText } from '@/components/SafeRichText'
import { ShareButton } from '@/components/ui/actions'
import { BUSINESS_LABEL, getPostBySlug, mediaUrl } from '@/lib/content'
import { tagList } from '@/lib/richtext'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>
const COVER: Record<string, string> = { construction: '/img/homedusk.webp', paper: '/img/papermill.webp', glass: '/img/cullet.webp', group: '/img/hero.webp' }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const p = await getPostBySlug(slug)
  return p ? { title: p.title, description: p.excerpt } : { title: 'Article not found' }
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const tags = tagList(post.tags)
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">{BUSINESS_LABEL[post.business || 'group']}{post.author ? ` · ${post.author}` : ''} · {post.readMinutes || 4} min read{date ? ` · ${date}` : ''} {post.sample && <span className="tag sample" style={{ marginLeft: 8 }}>Sample</span>}</p>
        <h1>{post.title}</h1>
        <p className="lede">{post.excerpt}</p>
      </section>
      <section className="co-section" style={{ paddingTop: 10 }}>
        <div className="ph" style={{ aspectRatio: '21 / 9', marginBottom: 28 }}><Image src={mediaUrl(post.cover, 'wide') || COVER[post.business || 'group']} alt="" width={1600} height={686} priority /></div>
        <div className="prose">
          {post.body && <SafeRichText data={post.body} />}
        </div>
        {tags.length > 0 && (
          <div className="ptags" style={{ marginTop: 24 }}>
            {tags.map((t) => <span className="ptag" key={t}>{t}</span>)}
          </div>
        )}
        <div className="btn-row" style={{ marginTop: 28 }}>
          <ShareButton shareTitle={post.title} path={`/blog/${post.slug}`}>Share</ShareButton>
          <Link className="btn ghost" href="/blog">All articles</Link>
        </div>
      </section>
    </div>
  )
}
