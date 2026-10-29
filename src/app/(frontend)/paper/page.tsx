import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { ClientLogos } from '@/components/ClientLogos'
import { EnquiryForm } from '@/components/EnquiryForm'
import { FaqSection } from '@/components/FaqSection'
import { PhotoGrid } from '@/components/PhotoGrid'
import { SectionBar } from '@/components/SectionBar'
import { BookVisitButton, ScrollLink } from '@/components/ui/actions'
import { PP_FLOW_ICONS, PP_OPT_ICONS, PP_STEP_ICONS, PP_TRADE_ICONS } from '@/components/ui/icons'
import { getFacts, getFaqs, getPartners, getSiteCopy, mediaList } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Suvarna Durga Paper', description: 'Machine-finished kraft paper for the packaging industry from Suvarna Durga Paper, Sangareddy: 100 to 250 GSM, 18 to 28 BF, two paper machines, 175,000 tonnes a year.' }

const STEPS = [
  ['Fibre Intake', 'Recovered paper and virgin pulp received and graded.'],
  ['Stock Preparation', 'Pulping, cleaning and refining to the required furnish.'],
  ['Forming', 'Sheet formed on the wire and pressed to remove water.'],
  ['Drying', 'Steam-heated cylinders bring the sheet to target moisture.'],
  ['Reeling & Slitting', 'Wound to reel and slit to the widths you order.'],
  ['Quality Testing', 'GSM, burst and cobb tested on every reel in the lab.'],
  ['Dispatch', 'Wrapped, labelled and despatched to schedule.'],
]
const RANGE = [
  ['/img/pp-sheets.webp', 'Paper & Sheets', 'Paper and board sheets in kraft, cream and navy'],
  ['/img/pp-covers.webp', 'Covers & Sleeves', 'A kraft cover with gold foil detail'],
  ['/img/pp-tags.webp', 'Headers & Tags', 'Printed packaging headers and swing tags'],
  ['/img/pp-boxes.webp', 'Packaging Solutions', 'Kraft boxes and envelopes'],
]
const OPTS = ['Sizes & Shapes', 'Brand Printing', 'Material Options', 'Finishes & Details']
const FLOW = [
  ['Share Specifications', 'Tell us your GSM, BF and quantity.'],
  ['Confirm Availability', 'Discuss grades, lead times and supply.'],
  ['Agree Your Order', 'Confirm specifications and commercial terms.'],
  ['Plan Delivery', 'Coordinate supply to your business.'],
]
const TRADE = [
  ['Corrugated box manufacturers', 'Reels slit to your deckle and delivered on a standing schedule.'],
  ['Packaging converters', 'Sheets and board for cartons, headers, tags and sleeves.'],
  ['Industrial packaging', 'Heavier grades for wrapping, void fill and export cases.'],
]

export default async function PaperPage() {
  const [facts, faqs, copy, clients] = await Promise.all([getFacts({ category: 'Paper' }), getFaqs({ business: 'paper', generalOnly: true }), getSiteCopy(), getPartners({ kind: 'client', business: 'paper' })])
  const fact = (re: RegExp) => facts.find((f) => re.test(f.claim))
  const gsm = fact(/grammage/i)?.value || '100–250 GSM'
  const bf = fact(/burst/i)?.value || '18–28 BF'
  const [gsmNum, gsmUnit] = gsm.split(' ')
  const [bfNum, bfUnit] = bf.split(' ')
  const team = fact(/team/i)
  const machines = fact(/machines/i)
  const capacity = fact(/capacity/i)
  const cap = capacity?.value || ''
  const growth = facts.filter((f) => /revenue|growth rate/i.test(f.claim) && f.value)
  const markets = fact(/markets/i)
  const strengths = [team && `Team strength of ${team.value} professionals`, machines && `${machines.value} paper machines of distinctive advantage`, capacity && `${capacity.value} capacity, up from 20 TPD`].filter(Boolean) as string[]
  const plant = mediaList(copy.paperGallery)
  const GRADES = [
    ['Kraft paper', 'Machine-finished kraft in natural and golden shades for corrugated board and general packaging.', gsm],
    ['Burst factor', 'Strength to the specification your converting line needs.', bf],
    ['Certified', `FSC and RoHS certified manufacturing on ${machines?.value || 'two'} paper machines.`, 'FSC · RoHS'],
    ['Markets', markets?.wording.replace(/^The paper business supplies packaging-industry customers across /, '') || 'Telangana, Andhra Pradesh, Tamil Nadu, Karnataka and Maharashtra.', 'Five states'],
  ]
  return (
    <div id="pp-top">
      <SectionBar
        sub="Paper" variant="dashes" label="Paper"
        links={[{ to: 'pp-top', label: 'About' }, { to: 'paperrange', label: 'Our Range' }, { to: 'papercustom', label: 'Customisation' }, { to: 'paperapps', label: 'Applications' }, { to: 'site-foot', label: 'Contact' }]}
        cta={<ScrollLink to="enquire" focus="eq-quantity" className="btn sm sentence">Request a Quote <i aria-hidden>→</i></ScrollLink>}
      />

      <section className="vtop">
        <div className="vtop-grid">
          <div className="vtop-copy">
            <p className="vtop-kicker">02 / Make</p>
            <h1>Kraft paper for<br /><em>the packaging trade.</em></h1>
            <p className="vtop-sub">{copy.paperIntro || 'Machine-finished kraft paper for the packaging industry throughout Telangana and Andhra Pradesh.'}</p>
            {strengths.length > 0 && <ul className="vtop-points">{strengths.map((s) => <li key={s}>{s}</li>)}</ul>}
            <div className="vtop-links">
              <ScrollLink to="paperrange">Explore Our Range <i>→</i></ScrollLink>
              <ScrollLink to="enquire" focus="eq-quantity">Request a Quotation <i>→</i></ScrollLink>
            </div>
          </div>
          <div className="vtop-art photo"><Image src="/img/paper-hero.webp" alt="SDG paper sheets, kraft covers, tags and boxes" width={1200} height={800} priority /></div>
        </div>
        <div className="trio-foot">
          <BookVisitButton className="trio-visit"><span>Planning a visit?</span><span className="trio-visit-cta">Choose a time <i>↗</i></span></BookVisitButton>
          <ScrollLink to="paperprocess" className="trio-scroll"><span>See the process</span><span className="trio-dashes"><i className="on" /><i /><i /></span></ScrollLink>
        </div>
      </section>

      <section className="process" id="paperprocess">
        <div className="wrap">
          <p className="process-kick">Our manufacturing process</p>
          <h2>From fibre to finished reel.</h2>
          <p className="process-sub">Seven stages, one specification.</p>
          <div className="psteps four">
            {STEPS.slice(0, 4).map(([t, d], i) => { const Icon = PP_STEP_ICONS[i]; return <div className="pstep" key={t}><span className="pico"><Icon /></span><span className="pnum">0{i + 1}</span><b>{t}</b><small>{d}</small></div> })}
          </div>
          <div className="psteps three">
            {STEPS.slice(4).map(([t, d], i) => { const Icon = PP_STEP_ICONS[i + 4]; return <div className="pstep" key={t}><span className="pico"><Icon /></span><span className="pnum">0{i + 5}</span><b>{t}</b><small>{d}</small></div> })}
          </div>
        </div>
      </section>

      <section className="pp-spec">
        <div className="wrap">
          <h2>Kraft paper for your requirements.</h2>
          <p className="pp-sub">Choose the paper weight and strength that suit your packaging needs.</p>
          <div className="pp-stats">
            <div><b>{gsmNum} <small>{gsmUnit}</small></b><span>Paper weight</span></div>
            <div><b>{bfNum} <small>{bfUnit}</small></b><span>Strength range</span></div>
            {cap && <div><b>{cap.split(' ')[0]} <small>{cap.split(' ').slice(1).join(' ')}</small></b><span>Capacity</span></div>}
          </div>
          <p className="pp-note">Published product range. Confirm availability when enquiring.</p>
        </div>
      </section>

      {growth.length > 0 && (
        <section className="pp-growth">
          <div className="wrap">
            <p className="process-kick">Growth</p>
            <div className="pp-growth-grid">
              {growth.map((f) => <div key={f.id}><b className="num">{f.value}</b><em>{f.claim}</em><span>{f.wording}</span></div>)}
            </div>
          </div>
        </section>
      )}

      <section className="pp-range" id="paperrange">
        <div className="wrap">
          <h2>One material. <em>Many possibilities.</em></h2>
          <div className="pp-figs">
            {RANGE.map(([src, cap, alt]) => <figure key={cap}><Image src={src} alt={alt} width={960} height={672} /><figcaption>{cap}</figcaption></figure>)}
          </div>
        </div>
      </section>

      <section className="gl-range">
        <div className="wrap">
          <p className="gl-kick">What we make</p>
          <h2>Grades we make.</h2>
          <p className="gl-sub">Machine-finished kraft, to your furnish and finish.</p>
          <div className="spec-grid">
            {GRADES.map(([b, s, e]) => <div key={b}><b>{b}</b><span>{s}</span><em>{e}</em></div>)}
          </div>
        </div>
      </section>

      <section className="pp-custom" id="papercustom">
        <div className="pp-custom-grid">
          <div className="pp-custom-copy">
            <h2>Make it <em>yours.</em></h2>
            <p>Designed around your product and your brand.</p>
            <div className="pp-opts">
              {OPTS.map((o, i) => { const Icon = PP_OPT_ICONS[i]; return <div key={o}><span className="pp-ico"><Icon /></span><b>{o}</b></div> })}
            </div>
          </div>
          <div className="pp-custom-art"><Image src="/img/pp-custom.webp" alt="An embossed SDG kraft cover and swing tag" width={1200} height={800} /></div>
        </div>
      </section>

      <section className="pp-steps">
        <div className="wrap">
          <h2>From requirement to <em>delivery.</em></h2>
          <ol className="pp-flow">
            {FLOW.map(([b, s], i) => { const Icon = PP_FLOW_ICONS[i]; return <li key={b}><span className="pp-n">0{i + 1}</span><b>{b}</b><small>{s}</small><span className="pp-fico"><Icon /></span></li> })}
          </ol>
        </div>
      </section>

      <section className="pp-trade" id="paperapps">
        <div className="wrap">
          <h2>Built for the packaging trade.</h2>
          <div className="pp-trade-grid">
            {TRADE.map(([h, p], i) => { const Icon = PP_TRADE_ICONS[i]; return <article key={h}><span className="pp-tico"><Icon /></span><h3>{h}</h3><p>{p}</p></article> })}
          </div>
          <ClientLogos clients={clients} kickClass="process-kick" title="Clients" />
        </div>
      </section>

      {plant.length > 0 && (
        <section className="pp-plant">
          <div className="wrap"><PhotoGrid photos={plant} kicker="Plant & equipment" title="Inside Suvarna Durga Paper Mills." kickClass="process-kick" columns={4} /></div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="pp-faq">
          <div className="wrap"><FaqSection faqs={faqs} title="Paper trade questions, answered." /></div>
        </section>
      )}

      <section className="pp-band on-dark">
        <div className="wrap">
          <h2>Tell us what <em>you need.</em></h2>
          <EnquiryForm business="paper" title="Request a quotation" dark />
        </div>
      </section>

      <p className="sr"><Link href="/contact">Contact</Link></p>
    </div>
  )
}
