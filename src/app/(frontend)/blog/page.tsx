import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { BUSINESS_LABEL, getPosts, mediaUrl } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Insights', description: 'Articles from Suvarna Durga Group on homes, paper and glass.' }

const COVER: Record<string, string> = { construction: '/img/homedusk.webp', paper: '/img/papermill.webp', glass: '/img/cullet.webp', group: '/img/hero.webp' }
const TAG: Record<string, string> = { construction: 'ptag', paper: 'ptag going', glass: 'ptag done', group: 'ptag soon' }

export default async function BlogPage() {
  const posts = await getPosts()
  const anySample = posts.some((p) => p.sample)
  return (
    <section className="co-section" style={{ paddingTop: 34 }}>
      <div className="wrap">
        <div className="projects-head">
          <div><p className="process-kick">Insights</p><h2 className="biz-h2">From the Group.</h2></div>
          {anySample && <span className="demochip">Sample content</span>}
        </div>
        {posts.length === 0 && <p className="lede">Articles are on their way. Published posts appear here.</p>}
        <div className="pgrid">
          {posts.map((p) => (
            <Link className="pcard" key={p.id} href={`/blog/${p.slug}`}>
              <Image src={mediaUrl(p.cover, 'card') || COVER[p.business || 'group']} alt="" width={960} height={640} />
              <b>{p.title}</b>
              <span className="ptags"><span className={TAG[p.business || 'group']}>{BUSINESS_LABEL[p.business || 'group']}</span><span className="ptag">{p.readMinutes || 4} min read</span></span>
              <span className="plainlink">Read <i>↗</i></span>
            </Link>
          ))}
        </div>
        {anySample && <p className="pnote">Placeholder articles for layout review. SDG supplies real posts through the admin.</p>}
      </div>
    </section>
  )
}
