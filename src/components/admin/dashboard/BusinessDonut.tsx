'use client'

import type { ApexOptions } from 'apexcharts'

import dynamic from 'next/dynamic'
import React from 'react'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export type DonutSlice = { color: string; label: string; value: number }

/** Share of enquiries per business over the last twelve months (TailAdmin's donut card). */
export function BusinessDonut({ slices, title, subtitle }: { slices: DonutSlice[]; subtitle: string; title: string }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const options: ApexOptions = {
    colors: slices.map((s) => s.color),
    labels: slices.map((s) => s.label),
    chart: { fontFamily: 'Outfit, sans-serif', type: 'donut', width: 240, height: 240 },
    stroke: { show: false, width: 4 },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: { show: true, offsetY: 0, color: '#1D2939', fontSize: '12px', fontWeight: 'normal', formatter: () => 'Enquiries' },
            value: { show: true, offsetY: 10, color: '#667085', fontSize: '14px', formatter: () => `${total} total` },
            total: { show: true, label: 'Enquiries', color: '#000000', fontSize: '20px', fontWeight: 'bold', formatter: () => `${total}` },
          },
        },
      },
    },
    states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'darken' } } },
    dataLabels: { enabled: false },
    tooltip: { enabled: true, y: { formatter: (v: number) => `${v}` } },
    legend: { show: false },
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-theme-sm text-gray-500">{subtitle}</p>
      <div className="mt-2 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="shrink-0">
          {total > 0 ? (
            <ReactApexChart options={options} series={slices.map((s) => s.value)} type="donut" width={240} height={240} />
          ) : (
            <div className="flex size-[240px] items-center justify-center rounded-full border-[18px] border-gray-100 text-sm text-gray-400">No enquiries yet</div>
          )}
        </div>
        <ul className="flex w-full flex-col gap-3">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-theme-sm text-gray-700">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="text-theme-sm font-medium text-gray-800">
                {s.value}
                <span className="ml-1 text-gray-400">({total ? Math.round((s.value / total) * 100) : 0}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
