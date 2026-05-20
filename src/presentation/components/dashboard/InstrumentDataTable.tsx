import type { InstrumentSlim } from '../../../domain/models/instrument'

type InstrumentDataTableProps = {
  instruments: InstrumentSlim[]
  isLoading: boolean
}

function formatNullable(value: string | boolean | null) {
  if (value === null) {
    return '-'
  }

  return value.toString()
}

export function InstrumentDataTable({
  instruments,
  isLoading,
}: InstrumentDataTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/55 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            API instruments
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Active instrument list
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {isLoading ? 'Loading' : `${instruments.length} rows`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <th className="px-6 py-4 font-semibold">Symbol</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Exchange</th>
              <th className="px-6 py-4 font-semibold">Active</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((instrument) => (
              <tr
                className="border-t border-slate-200/70 text-sm text-slate-700 transition-colors hover:bg-slate-50/80"
                key={instrument.id}
              >
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900">
                    {instrument.symbol}
                  </span>
                </td>
                <td className="px-6 py-4">{formatNullable(instrument.name)}</td>
                <td className="px-6 py-4">{formatNullable(instrument.type)}</td>
                <td className="px-6 py-4">
                  {formatNullable(instrument.exchange)}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {formatNullable(instrument.active)}
                  </span>
                </td>
              </tr>
            ))}

            {!isLoading && instruments.length === 0 ? (
              <tr className="border-t border-slate-200/70 text-sm text-slate-500">
                <td className="px-6 py-8 text-center" colSpan={5}>
                  No active instruments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
