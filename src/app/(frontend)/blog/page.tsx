import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { BUSINESS_LABEL, getPosts, mediaUrl } from '@/lib/content'
import type { Post } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'News & Blogs', description: 'Press coverage and articles from Suvarna Durga Group: constructions, paper and glass bottles.' }

const COVER: Record<string, string> = { construction: '/img/homedusk.webp', paper: '/img/papermill.webp', glass: '/img/cullet.webp', agro: '/img/sdg/agro.jpg', group: '/img/hero.webp' }
const TAG: Record<string, string> = { construction: 'ptag', paper: 'ptag going', glass: 'ptag done', agro: 'ptag soon', group: 'ptag soon' }

/** A press item opens the publication in a new tab; an article opens its page here. */
function Card({ p }: { p: Post }) {
  const inner = (
    <>
      <Image src={mediaUrl(p.cover, 'card') || COVER[p.business || 'group']} alt="" width={960} height={640} />
      <b>{p.title}</b>
      <span className="ptags">
        <span className={TAG[p.business || 'group']}>{BUSINESS_LABEL[p.business || 'group']}</span>
        {p.externalUrl ? <span className="ptag">{p.source || 'Press'}</span> : <span className="ptag">{p.readMinutes || 4} min read</span>}
      </span>
      <span className="plainlink">{p.externalUrl ? 'Read article' : 'Read'} <i>↗</i></span>
    </>
  )
  return p.externalUrl
    ? <a className="pcard" href={p.externalUrl} target="_blank" rel="noreferrer">{inner}</a>
    : <Link className="pcard" href={`/blog/${p.slug}`}>{inner}</Link>
}

export default async function BlogPage() {
  const posts = await getPosts(24)
  const anySample = posts.some((p) => p.sample)
  const news = posts.filter((p) => p.externalUrl)
  const articles = posts.filter((p) => !p.externalUrl)
  return (
    <section className="co-section" style={{ paddingTop: 34 }}>
      <div className="wrap">
        <div className="projects-head">
          <div><p className="process-kick">News &amp; Blogs</p><h2 className="biz-h2">From the Group.</h2></div>
          {anySample && <span className="demochip">Sample content</span>}
        </div>
        {posts.length === 0 && <p className="lede">Articles are on their way. Published posts appear here.</p>}
        {news.length > 0 && (
          <>
            <p className="co-kick" style={{ marginBottom: 18 }}>News &amp; events</p>
            <div className="pgrid">{news.map((p) => <Card key={p.id} p={p} />)}</div>
          </>
        )}
        {articles.length > 0 && (
          <>
            <p className="co-kick" style={{ margin: `${news.length ? 48 : 0}px 0 18px` }}>Articles</p>
            <div className="pgrid">{articles.map((p) => <Card key={p.id} p={p} />)}</div>
          </>
        )}
        {anySample && <p className="pnote">Placeholder articles for layout review. SDG supplies real posts through the admin.</p>}
      </div>
    </section>
  )
}
