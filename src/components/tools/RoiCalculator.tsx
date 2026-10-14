'use client'

import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

import { useUi } from '../ui/UiProvider'

const SECTORS: Record<string, { rent: number; cap: number; esc: number; opex: number; occ: number; price: number }> = {
  'Grade A office': { rent: 85, cap: 8, esc: 5, opex: 12, occ: 92, price: 11000 },
  'Retail / high street': { rent: 140, cap: 7.5, esc: 6, opex: 18, occ: 88, price: 18000 },
  'Warehousing / industrial': { rent: 28, cap: 8.5, esc: 4, opex: 4, occ: 95, price: 3800 },
  'Managed co-working': { rent: 110, cap: 9, esc: 6, opex: 35, occ: 85, price: 11000 },
}
const cr = (n: number) => { const a = Math.abs(n); return (n < 0 ? '−' : '') + (a >= 1e7 ? `₹${(a / 1e7).toFixed(2)} Cr` : a >= 1e5 ? `₹${(a / 1e5).toFixed(1)} L` : `₹${Math.round(a).toLocaleString('en-IN')}`) }

type Row = { y: number; rent: number; noi: number; cum: number }

function Chart({ rows }: { rows: Row[] }) {
  const W = 520, H = 200, pl = 10, pr = 10, pt = 22, pb = 26, n = rows.length
  const max = Math.max(...rows.map((r) => r.cum), 1) * 1.05
  const bw = Math.min(28, ((W - pl - pr) / n) * 0.55)
  const x = (i: number) => pl + (i + 0.5) * ((W - pl - pr) / n)
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max)
  return (
    <svg className="roi-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Net income per year (bars) and cumulative (line)">
      <text x={pl} y={12} fontSize="11" fill="#56647C">Bars: annual net income · Line: cumulative</text>
      <line x1={pl} x2={W - pr} y1={y(0)} y2={y(0)} stroke="#E7E1D5" />
      {rows.map((r, i) => <rect key={r.y} x={x(i) - bw / 2} y={y(Math.max(0, r.noi))} width={bw} height={Math.abs(y(0) - y(r.noi))} rx="3" fill="#C9A14A" opacity=".55"><title>{`Year ${r.y}: net income ${cr(r.noi)}`}</title></rect>)}
      <path d={rows.map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r.cum)}`).join(' ')} fill="none" stroke="#101F3C" strokeWidth="2.5" strokeLinejoin="round" />
      {rows.map((r, i) => <circle key={r.y} cx={x(i)} cy={y(r.cum)} r="3.5" fill="#101F3C"><title>{`Cumulative to year ${r.y}: ${cr(r.cum)}`}</title></circle>)}
      {rows.map((r, i) => (n <= 10 || i % 2 === 0) && <text key={r.y} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#56647C">Y{r.y}</text>)}
    </svg>
  )
}

/** Indicative yields and returns for leasing or investing in SDG commercial space. Sector presets are starting points. */
export function RoiCalculator() {
  const ui = useUi()
  const router = useRouter()
  const [sector, setSector] = useState('Grade A office')
  const [v, setV] = useState({ area: 10000, price: 11000, rent: 85, occ: 92, esc: 5, opex: 12, years: 7, cap: 8 })
  const set = (k: keyof typeof v, val: number) => setV((s) => ({ ...s, [k]: val }))
  const preset = (s: string) => { setSector(s); const p = SECTORS[s]; setV((cur) => ({ ...cur, rent: p.rent, cap: p.cap, esc: p.esc, opex: p.opex, occ: p.occ, price: p.price })) }

  const out = useMemo(() => {
    const inv = v.area * v.price
    const rows: Row[] = []
    let cum = 0
    for (let y = 1; y <= v.years; y++) {
      const rent = v.area * v.rent * 12 * (v.occ / 100) * Math.pow(1 + v.esc / 100, y - 1)
      const noi = rent - v.area * v.opex * 12
      cum += noi
      rows.push({ y, rent, noi, cum })
    }
    const last = rows[rows.length - 1]
    const exit = last.noi / (v.cap / 100)
    return { inv, rows, cum, exit, total: cum + exit - inv, cagr: Math.pow((cum + exit) / inv, 1 / v.years) - 1, gy: rows[0].rent / inv, ny: rows[0].noi / inv }
  }, [v])
  const ROIS = `ROI scenario, ${sector}: ${v.area.toLocaleString('en-IN')} sq ft at ₹${v.price.toLocaleString('en-IN')}/sq ft, rent ₹${v.rent}/sq ft/month, year-1 net yield ${(out.ny * 100).toFixed(1)}%, ${v.years}-year CAGR ${(out.cagr * 100).toFixed(1)}% (indicative)`
  const enquire = () => { try { sessionStorage.setItem('sdg-prefill', ROIS) } catch { /* storage unavailable */ } ui.toast('Scenario attached to your enquiry'); router.push('/contact') }

  const slider = (k: keyof typeof v, label: string, min: number, max: number, step: number, fmt: (n: number) => string = (n) => n.toLocaleString('en-IN')) => (
    <React.Fragment key={k}>
      <label htmlFor={`r-${k}`}>{label} <span className="num">{fmt(v[k])}</span></label>
      <input type="range" id={`r-${k}`} min={min} max={max} step={step} value={v[k]} onChange={(e) => set(k, +e.target.value)} />
    </React.Fragment>
  )

  return (
    <div className="roi-grid">
      <form className="card calc roi-inputs" onSubmit={(e) => e.preventDefault()}>
        <span className="eyebrow">Your scenario</span>
        <label htmlFor="rSector">Sector</label>
        <select id="rSector" value={sector} onChange={(e) => preset(e.target.value)}>{Object.keys(SECTORS).map((k) => <option key={k}>{k}</option>)}</select>
        {slider('area', 'Area, sq ft', 2000, 50000, 500)}
        {slider('price', 'Purchase price, ₹ / sq ft', 2000, 25000, 100)}
        {slider('rent', 'Rent, ₹ / sq ft / month', 15, 250, 1)}
        {slider('occ', 'Occupancy, %', 50, 100, 1)}
        {slider('esc', 'Rent escalation, % a year', 0, 10, 0.5)}
        {slider('opex', 'Operating cost, ₹ / sq ft / month', 0, 60, 1)}
        {slider('years', 'Holding period, years', 3, 15, 1)}
        {slider('cap', 'Exit cap rate, %', 5, 12, 0.25)}
      </form>
      <div className="card">
        <span className="eyebrow">Indicative results</span>
        <div className="roi-out">
          <div><b>{cr(out.inv)}</b><span>Investment</span></div>
          <div><b>{(out.gy * 100).toFixed(1)}%</b><span>Year-1 gross yield</span></div>
          <div><b>{(out.ny * 100).toFixed(1)}%</b><span>Year-1 net yield</span></div>
          <div><b>{cr(out.cum)}</b><span>Cumulative net income</span></div>
          <div><b>{cr(out.exit)}</b><span>Exit value at cap rate</span></div>
          <div><b>{cr(out.total)}</b><span>Total return</span></div>
          <div><b>{(out.cagr * 100).toFixed(1)}%</b><span>CAGR</span></div>
        </div>
        <Chart rows={out.rows} />
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button type="button" className="btn accent" onClick={enquire}>Enquire with this scenario</button>
          <button type="button" className="btn ghost" onClick={() => ui.openShare({ title: 'SDG ROI scenario', text: ROIS, path: '/roi' })}>Share</button>
          <button type="button" className="btn ghost" onClick={() => window.print()}>Download PDF</button>
        </div>
        <p className="disclaimer" style={{ marginTop: 14 }}>Indicative only, from sample assumptions. Not a financial projection, an offer or investment advice; returns are not guaranteed.</p>
      </div>
    </div>
  )
}
