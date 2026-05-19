import { useDeferredValue } from 'react'

import type { DashboardRow } from '../../../domain/entities/dashboard/dashboard'

type DashboardDataTableProps = {
  rows: DashboardRow[]
}

function formatSignedChange(value: number) {
  const absolute = Math.abs(value).toFixed(2)
  return `${value >= 0 ? '+' : '-'}${absolute}%`
}

export function DashboardDataTable({ rows }: DashboardDataTableProps) {
  const deferredRows = useDeferredValue(rows)

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/55 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Live market feed
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Streaming data table
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {deferredRows.length} rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <th className="px-6 py-4 font-semibold">Symbol</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Change</th>
              <th className="px-6 py-4 font-semibold">Volume</th>
              <th className="px-6 py-4 font-semibold">Updated</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {deferredRows.map((row) => {
              const positive = row.change >= 0

              return (
                <tr
                  key={row.id}
                  className="border-t border-slate-200/70 text-sm text-slate-700 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">
                      {row.symbol}
                    </span>
                  </td>
                  <td className="px-6 py-4">${row.price.toFixed(2)}</td>
                  <td
                    className={`px-6 py-4 font-semibold ${
                      positive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatSignedChange(row.change)}
                  </td>
                  <td className="px-6 py-4">{row.volume.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(row.updatedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        positive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {row.status ?? (positive ? 'up' : 'down')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
