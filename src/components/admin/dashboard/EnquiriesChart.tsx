'use client'

import type { ApexOptions } from 'apexcharts'

import dynamic from 'next/dynamic'
import React from 'react'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export type ChartSeries = { data: number[]; name: string }[]

/** Enquiries per month for the last twelve months, stacked by business (TailAdmin's monthly bar chart). */
export function EnquiriesChart({ categories, series, total }: { categories: string[]; series: ChartSeries; total: number }) {
  const options: ApexOptions = {
    colors: ['#465fff', '#0ba5ec', '#12b76a', '#98a2b3'],
    chart: { fontFamily: 'Outfit, sans-serif', type: 'bar', height: 220, stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '39%', borderRadius: 5, borderRadiusApplication: 'end', borderRadiusWhenStacked: 'last' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ['transparent'] },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    legend: { show: true, position: 'top', horizontalAlign: 'left', fontFamily: 'Outfit', markers: { size: 5, shape: 'circle', strokeWidth: 0 } },
    yaxis: { title: { text: undefined }, labels: { formatter: (v: number) => `${Math.round(v)}` } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { x: { show: true }, y: { formatter: (val: number) => `${val}` } },
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Enquiries per month</h3>
          <p className="mt-1 text-theme-sm text-gray-500">Last 12 months, by business</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-theme-sm font-medium text-gray-700">{total} total</span>
      </div>
      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
          <ReactApexChart options={options} series={series} type="bar" height={220} />
        </div>
      </div>
    </div>
  )
}
