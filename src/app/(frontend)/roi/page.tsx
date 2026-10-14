import type { Metadata } from 'next'
import React from 'react'

import { RoiCalculator } from '@/components/tools/RoiCalculator'

export const metadata: Metadata = { title: 'ROI calculator', description: 'Indicative yields and returns for leasing or investing in SDG commercial space.' }

export default function RoiPage() {
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Industry ROI calculator</p>
        <h1>What could SDG space<br /><em>return for you?</em></h1>
        <p className="lede">Indicative yields and returns for leasing or investing in SDG commercial space. Sector presets are starting points; move the sliders to your own numbers.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 24 }}><RoiCalculator /></section>
    </div>
  )
}
