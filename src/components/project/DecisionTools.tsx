'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { useUi } from '../ui/UiProvider'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

/** EMI calculator, monthly bills estimator and house-tax indicator for a residential project. Indicative only. */
export function DecisionTools({ name, slug, priceFromLakh, configurations }: { name: string; slug: string; priceFromLakh?: number | null; configurations: { label: string; sizeSqft?: number | null }[] }) {
  const ui = useUi()
  const router = useRouter()
  const configs = configurations.filter((c) => c.sizeSqft)
  const base = Math.max(2_000_000, Math.round(((priceFromLakh || 180) * 100_000 * 0.8) / 100_000) * 100_000)
  const [amt, setAmt] = useState(Math.min(base, 100_000_000))
  const [rate, setRate] = useState(8.5)
  const [yrs, setYrs] = useState(20)
  const [cfg, setCfg] = useState(0)
  const [occ, setOcc] = useState(4)
  const [ac, setAc] = useState<'light' | 'moderate' | 'heavy'>('moderate')
  const [mrv, setMrv] = useState(6)

  // All three are a handful of arithmetic operations, so they are recomputed on every render.
  const R = rate / 1200, N = yrs * 12
  const emiMonthly = (amt * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
  const emi = { e: emiMonthly, interest: emiMonthly * N - amt, total: emiMonthly * N }
  const area = configs[cfg]?.sizeSqft || 2500
  const units = 120 + 60 * occ + { light: 150, moderate: 350, heavy: 650 }[ac]
  const maint = 3.5 * area, power = units * 7.5, water = 300 + 150 * occ, gas = 600 + 150 * occ, net = 1200
  const bills = { maint, power, units, water, gas, net, tot: maint + power + water + gas + net }
  const monthly = area * mrv, arv = monthly * 12
  const taxRate = monthly <= 50 ? 0 : monthly <= 100 ? 0.17 : monthly <= 200 ? 0.19 : monthly <= 300 ? 0.22 : 0.3
  const taxBase = arv * taxRate, dep = taxBase * 0.1, cess = (taxBase - dep) * 0.08
  const tax = { arv, r: taxRate, dep, cess, tot: taxBase - dep + cess }

  const enquireWith = (summary: string) => {
    try { sessionStorage.setItem('sdg-prefill', summary) } catch { /* storage unavailable */ }
    ui.toast('Scenario attached to your enquiry')
    router.push('/contact')
  }
  const EMIS = `EMI scenario, ${name}: ${inr(emi.e)}/month on a ${inr(amt)} loan at ${rate.toFixed(2)}% for ${yrs} years (indicative)`
  const BILLS = `Monthly bills estimate, ${name}: about ${inr(bills.tot)} a month for ${configs[cfg]?.label || 'the home'}, ${occ} occupants (indicative)`
  const HTAX = `House tax indicator, ${name}: about ${inr(tax.tot)} a year at ₹${mrv.toFixed(1)}/sq ft rental value (indicative)`

  return (
    <section id="tools" style={{ paddingTop: 36 }}>
      <div className="grid g2">
        <div className="card calc">
          <span className="eyebrow">Decision tools</span><h3 style={{ margin: '6px 0 4px' }}>EMI calculator</h3>
          <label htmlFor="amt">Loan amount <span className="num">{inr(amt)}</span></label><input type="range" id="amt" min={2_000_000} max={100_000_000} step={100_000} value={amt} onChange={(e) => setAmt(+e.target.value)} />
          <label htmlFor="rate">Interest rate <span className="num">{rate.toFixed(2)}%</span></label><input type="range" id="rate" min={6.5} max={12} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} />
          <label htmlFor="yrs">Tenure <span className="num">{yrs} years</span></label><input type="range" id="yrs" min={5} max={30} step={1} value={yrs} onChange={(e) => setYrs(+e.target.value)} />
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span className="eyebrow">Monthly EMI</span><div className="emi num">{inr(emi.e)}</div>
          <dl className="kv"><dt>Total interest</dt><dd className="num">{inr(emi.interest)}</dd><dt>Total repayment</dt><dd className="num">{inr(emi.total)}</dd></dl>
          <div className="btn-row"><button className="btn accent" type="button" onClick={() => enquireWith(EMIS)}>Enquire with this plan</button><button className="btn ghost" type="button" onClick={() => ui.openShare({ title: `${name}, EMI scenario`, text: EMIS, path: `/projects/${slug}` })}>Share</button></div>
          <p className="disclaimer">Indicative only. Actual EMI depends on lender terms.</p>
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 8 }}>
        <div className="card calc">
          <span className="eyebrow">Decision tools</span><h3 style={{ margin: '6px 0 4px' }}>Monthly bills estimator</h3>
          <label htmlFor="bcConf">Configuration</label>
          <select id="bcConf" value={cfg} onChange={(e) => setCfg(+e.target.value)}>{configs.map((c, i) => <option key={i} value={i}>{c.label} · {c.sizeSqft?.toLocaleString('en-IN')} sq ft</option>)}{configs.length === 0 && <option value={0}>Typical home · 2,500 sq ft</option>}</select>
          <label htmlFor="bcOcc">Occupants <span className="num">{occ}</span></label><input type="range" id="bcOcc" min={1} max={8} step={1} value={occ} onChange={(e) => setOcc(+e.target.value)} />
          <label htmlFor="bcAc">Air-conditioning use</label>
          <select id="bcAc" value={ac} onChange={(e) => setAc(e.target.value as typeof ac)}><option value="light">Light, bedrooms at night</option><option value="moderate">Moderate</option><option value="heavy">Heavy, all rooms, all day</option></select>
          <dl className="tool-out"><dt>Maintenance (₹3.5 / sq ft)</dt><dd className="num">{inr(bills.maint)}</dd><dt>Electricity</dt><dd className="num">{inr(bills.power)} · {bills.units} units</dd><dt>Water</dt><dd className="num">{inr(bills.water)}</dd><dt>Piped gas</dt><dd className="num">{inr(bills.gas)}</dd><dt>Internet &amp; DTH</dt><dd className="num">{inr(bills.net)}</dd><dt className="tot">Estimated total / month</dt><dd className="num tot">{inr(bills.tot * 0.9)} – {inr(bills.tot * 1.1)}</dd></dl>
          <div className="btn-row" style={{ marginTop: 14 }}><button className="btn accent" type="button" onClick={() => enquireWith(BILLS)}>Enquire with this estimate</button><button className="btn ghost" type="button" onClick={() => ui.openShare({ title: `${name}, monthly bills estimate`, text: BILLS, path: `/projects/${slug}` })}>Share</button></div>
          <p className="disclaimer" style={{ marginTop: 12 }}>Sample rates until SDG&apos;s signed-off calculation sheet and the society&apos;s maintenance tariff replace them.</p>
        </div>
        <div className="card calc">
          <span className="eyebrow">Decision tools</span><h3 style={{ margin: '6px 0 4px' }}>House tax indicator</h3>
          <label htmlFor="htMrv">Monthly rental value <span className="num">₹{mrv.toFixed(1)} / sq ft</span></label><input type="range" id="htMrv" min={2} max={12} step={0.5} value={mrv} onChange={(e) => setMrv(+e.target.value)} />
          <dl className="tool-out"><dt>Annual rental value</dt><dd className="num">{inr(tax.arv)}</dd><dt>Tax rate (GHMC slab)</dt><dd className="num">{Math.round(tax.r * 100)}%</dd><dt>Less depreciation (10%)</dt><dd className="num">− {inr(tax.dep)}</dd><dt>Library cess (8%)</dt><dd className="num">+ {inr(tax.cess)}</dd><dt className="tot">Indicative property tax / year</dt><dd className="num tot">{inr(tax.tot)} · {inr(tax.tot / 12)} / month</dd></dl>
          <div className="btn-row" style={{ marginTop: 14 }}><button className="btn accent" type="button" onClick={() => enquireWith(HTAX)}>Enquire with this estimate</button><button className="btn ghost" type="button" onClick={() => ui.openShare({ title: `${name}, house tax indicator`, text: HTAX, path: `/projects/${slug}` })}>Share</button></div>
          <p className="disclaimer" style={{ marginTop: 12 }}>Indicative, using the GHMC residential formula with a sample rental value. Not a tax assessment.</p>
        </div>
      </div>
    </section>
  )
}
