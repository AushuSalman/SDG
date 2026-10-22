import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { PhotoGrid } from '@/components/PhotoGrid'
import { getFacts, getSiteCopy, mediaList, mediaUrl, paragraphs } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'About us', description: 'Suvarna Durga Group since 1978: constructions, paper and glass bottles from Hyderabad. Our values, our legacy, our milestones and our corporate social responsibility.' }

const VALUE_ICONS = ['/img/sdg/value-transparency.png', '/img/sdg/value-people.png', '/img/sdg/value-growth.png', '/img/sdg/value-delivering.png']

/** About, Legacy and CSR from sdg.in in one page: copy from Website → Website copy, numbers from approved facts. */
export default async function AboutPage() {
  const [copy, identity, history, csr, verticals] = await Promise.all([
    getSiteCopy(), getFacts({ category: 'Corporate Identity' }), getFacts({ category: 'History & Timeline' }), getFacts({ category: 'CSR & Sustainability' }), getFacts({ category: 'Business Verticals' }),
  ])
  // An approved Business Verticals fact replaces the default copy on each business card.
  const vertical = (business: string) => verticals.find((f) => f.business === business)?.wording
  const description = identity.find((f) => /description/i.test(f.claim))?.wording
  const founder = identity.find((f) => /founder/i.test(f.claim))?.wording
  const values = copy.values?.length ? copy.values : []
  const legacy = paragraphs(copy.legacyBody)
  // The portrait is used at its uploaded size: the landscape card crop would cut the face.
  const founderPhoto = mediaUrl(copy.legacyPhoto)
  const csrBody = paragraphs(copy.csrBody)
  const office = mediaList(copy.officeGallery)
  const csrPhotos = mediaList(copy.csrGallery)
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">The Group</p>
        <h1>True gold<br /><em>since 1978.</em></h1>
        <p className="lede">{copy.aboutIntro || description}</p>
        {description && copy.aboutIntro && <p className="lede" style={{ marginTop: 10 }}>{description}</p>}
        {founder && <p className="lede" style={{ marginTop: 10 }}>{founder}</p>}
      </section>

      {values.length > 0 && (
        <section className="co-section values-sec" style={{ paddingTop: 0 }}>
          <p className="co-kick">Our values</p>
          {copy.philosophy && <h2 className="values-lead">{copy.philosophy}</h2>}
          <ol className="values">
            {values.map((v, i) => (
              <li key={v.id || v.title}>
                {VALUE_ICONS[i] && <Image src={VALUE_ICONS[i]} alt="" width={56} height={56} />}
                <b>{v.title}</b>
                {v.text && <span>{v.text}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="co-section" style={{ paddingTop: 0 }} id="story">
        <div className="grid g2" style={{ alignItems: 'center', marginBottom: 40 }}>
          <div className="ph" style={{ aspectRatio: '16 / 10' }}><Image src="/img/sdg/first-factory.jpg" alt="The first Suvarna Durga factory" width={1200} height={750} /></div>
          <div>
            <p className="co-kick">Our story</p>
            <h2>From waste paper to the Financial District.</h2>
            <span className="rule-line" />
            {copy.origins && <p className="lede" style={{ fontSize: 16 }}>{copy.origins}</p>}
          </div>
        </div>
        <p className="co-kick">Key milestones</p>
        <ol className="timeline">
          {history.map((f) => <li key={f.id}><b>{f.value}</b><span>{f.wording}</span></li>)}
        </ol>
      </section>

      <section className="co-section" style={{ paddingTop: 0 }} id="verticals">
        <p className="co-kick">Verticals</p>
        <div className="grid g3 verticals">
          <div className="card"><p className="co-kick">01 — Build</p><h3>Suvarna Durga Constructions</h3><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>{vertical('construction') || 'Residential and Grade A commercial across Hyderabad, every project RERA registered and published.'}</p><p style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/real-estate">Constructions →</Link></p></div>
          <div className="card"><p className="co-kick">02 — Make</p><h3>Suvarna Durga Paper</h3><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>{vertical('paper') || 'Machine-finished kraft from Sangareddy, 100 to 250 GSM and 18 to 28 BF, FSC and RoHS certified.'}</p><p style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/paper">Paper →</Link></p></div>
          <div className="card"><p className="co-kick">03 — Renew</p><h3>Suvarna Durga Bottles</h3><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>{vertical('glass') || 'Returnable bottles recovered, washed and supplied back to fillers through eleven warehouses across two states.'}</p><p style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/glass">Glass bottles →</Link></p></div>
        </div>
      </section>

      {(legacy.length > 0 || founderPhoto) && (
        <section className="co-section legacy" style={{ paddingTop: 0 }} id="legacy">
          <div className="grid g2" style={{ alignItems: 'start' }}>
            <div className="ph legacy-photo" style={{ aspectRatio: '4 / 5' }}>
              {founderPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={founderPhoto} alt="Sri Jakkireddy Subbareddy, founder" />
              ) : <Image src="/img/sdg/founder.jpg" alt="Sri Jakkireddy Subbareddy, founder" width={960} height={1200} />}
            </div>
            <div>
              <p className="co-kick">Legacy · Sri Jakkireddy Subbareddy</p>
              <h2>{copy.legacyTitle || 'A founding father and a great visionary'}</h2>
              <span className="rule-line" />
              {legacy.map((p, i) => <p key={i} className="lede" style={{ fontSize: 16, marginTop: i ? 12 : 0 }}>{p}</p>)}
              <p className="btn-row" style={{ marginTop: 20 }}><Link className="btn accent" href="/leadership">Meet the leadership</Link><Link className="btn ghost" href="/contact">Contact the Group</Link></p>
            </div>
          </div>
        </section>
      )}

      {(csrBody.length > 0 || csr.length > 0) && (
        <section className="co-section" style={{ paddingTop: 0 }} id="csr">
          <p className="co-kick">Corporate social responsibility</p>
          <h2>Giving back, from day one.</h2>
          <div className="grid g2" style={{ alignItems: 'start', marginTop: 18 }}>
            <div>{csrBody.map((p, i) => <p key={i} className="lede" style={{ fontSize: 16, marginTop: i ? 12 : 0 }}>{p}</p>)}</div>
            {csr.length > 0 && (
              <div className="csr-facts">
                {csr.map((f) => <div key={f.id}>{f.value && <b>{f.value}</b>}<span>{f.wording}</span></div>)}
              </div>
            )}
          </div>
          <PhotoGrid photos={csrPhotos} columns={6} />
        </section>
      )}

      {office.length > 0 && (
        <section className="co-section" style={{ paddingTop: 0 }} id="office">
          <PhotoGrid photos={office} kicker="Corporate office" title="VSD Tech Park, Financial District." columns={3} />
        </section>
      )}
    </div>
  )
}
