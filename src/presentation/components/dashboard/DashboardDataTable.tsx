import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import type { DashboardRow } from '../../../domain/entities/dashboard/dashboard'
import type { InstrumentSlim } from '../../../domain/models/instrument'
import { useDashboardStreamControlStore } from '../../dashboard/DashboardStreamControlContext'
import { dashboardQuoteStore } from '../../stores/dashboardQuoteStore'

const PAGE_SIZE = 10

type DashboardDataTableProps = {
  instruments: InstrumentSlim[]
}

type DashboardTableRowProps = {
  instrument: InstrumentSlim
}

function formatSignedChange(value: number) {
  const absolute = Math.abs(value).toFixed(2)
  return `${value >= 0 ? '+' : '-'}${absolute}%`
}

function formatQuoteValue(value: number | undefined, digit: number | null) {
  if (value === undefined) {
    return ''
  }

  const fractionDigits = digit === null ? 5 : Math.min(Math.max(digit, 0), 8)

  return value.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  })
}

function useQuoteField<TField extends keyof DashboardRow>(
  instrument: InstrumentSlim,
  field: TField,
) {
  return useSyncExternalStore(
    (listener) =>
      dashboardQuoteStore.subscribeField(
        instrument.id,
        instrument.symbol,
        field,
        listener,
      ),
    () => dashboardQuoteStore.getField(instrument.id, instrument.symbol, field),
    () => undefined,
  )
}

const SymbolCell = memo(function SymbolCell({ symbol }: { symbol: string }) {
  return (
    <td className="px-6 py-4">
      <span className="font-semibold text-slate-900">{symbol}</span>
    </td>
  )
})

const BidCell = memo(function BidCell({
  instrument,
}: {
  instrument: InstrumentSlim
}) {
  const bid = useQuoteField(instrument, 'bid')

  return (
    <td className="px-6 py-4">{formatQuoteValue(bid, instrument.digit)}</td>
  )
})

const AskCell = memo(function AskCell({
  instrument,
}: {
  instrument: InstrumentSlim
}) {
  const ask = useQuoteField(instrument, 'ask')

  return (
    <td className="px-6 py-4">{formatQuoteValue(ask, instrument.digit)}</td>
  )
})

const CloseCell = memo(function CloseCell({
  instrument,
}: {
  instrument: InstrumentSlim
}) {
  const close = useQuoteField(instrument, 'close')
  const price = useQuoteField(instrument, 'price')

  return (
    <td className="px-6 py-4">
      {formatQuoteValue(close ?? price, instrument.digit)}
    </td>
  )
})

const ChangeCell = memo(function ChangeCell({
  instrument,
}: {
  instrument: InstrumentSlim
}) {
  const change = useQuoteField(instrument, 'change')
  const positive = change === undefined ? null : change >= 0

  return (
    <td
      className={`px-6 py-4 font-semibold ${
        positive === null
          ? ''
          : positive
            ? 'text-emerald-600'
            : 'text-rose-600'
      }`}
    >
      {change === undefined ? '' : formatSignedChange(change)}
    </td>
  )
})

const UpdatedCell = memo(function UpdatedCell({
  instrument,
}: {
  instrument: InstrumentSlim
}) {
  const updatedAt = useQuoteField(instrument, 'updatedAt')

  return (
    <td className="px-6 py-4 text-slate-500">
      {updatedAt ? new Date(updatedAt).toLocaleTimeString() : ''}
    </td>
  )
})

const StatusCell = memo(function StatusCell({
  instrument,
}: {
  instrument: InstrumentSlim
}) {
  const change = useQuoteField(instrument, 'change')
  const status = useQuoteField(instrument, 'status')
  const positive = change === undefined ? null : change >= 0

  return (
    <td className="px-6 py-4">
      {positive === null ? null : (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            positive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {status ?? (positive ? 'up' : 'down')}
        </span>
      )}
    </td>
  )
})

const DashboardTableRow = memo(
  function DashboardTableRow({ instrument }: DashboardTableRowProps) {
    return (
      <tr className="border-t border-slate-200/70 text-sm text-slate-700 transition-colors hover:bg-slate-50/80">
        <SymbolCell symbol={instrument.symbol} />
        <BidCell instrument={instrument} />
        <AskCell instrument={instrument} />
        <CloseCell instrument={instrument} />
        <ChangeCell instrument={instrument} />
        <UpdatedCell instrument={instrument} />
        <StatusCell instrument={instrument} />
      </tr>
    )
  },
  (previous, next) =>
    previous.instrument.id === next.instrument.id &&
    previous.instrument.symbol === next.instrument.symbol &&
    previous.instrument.digit === next.instrument.digit,
)

const StreamSubscriptionToggle = memo(function StreamSubscriptionToggle() {
  const streamControlStore = useDashboardStreamControlStore()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const snapshotRef = useRef(streamControlStore.getSnapshot())

  function handleToggleSubscription() {
    if (snapshotRef.current.isSubscribed) {
      streamControlStore.unsubscribeStream()
    } else {
      streamControlStore.subscribeStream()
    }
  }

  useEffect(() => {
    const updateButton = () => {
      const button = buttonRef.current
      const snapshot = streamControlStore.getSnapshot()
      snapshotRef.current = snapshot

      if (!button) {
        return
      }

      button.ariaPressed = snapshot.isSubscribed.toString()
      button.className = `rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        snapshot.isSubscribed
          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      }`
      button.disabled = !snapshot.canToggleSubscription
      button.title = snapshot.subscriptionData
        ? `${snapshot.isSubscribed ? 'Unsubscribe' : 'Subscribe'} ${
            snapshot.subscriptionData
          }`
        : 'Waiting for instruments'
      button.textContent = snapshot.isSubscribed ? 'Unsubscribe' : 'Subscribe'
    }

    updateButton()

    return streamControlStore.subscribe(updateButton)
  }, [streamControlStore])

  return (
    <button
      aria-pressed="true"
      className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45"
      onClick={handleToggleSubscription}
      ref={buttonRef}
      title="Waiting for instruments"
      type="button"
    >
      Unsubscribe
    </button>
  )
})

export const DashboardDataTable = memo(function DashboardDataTable({
  instruments,
}: DashboardDataTableProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(instruments.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE
  const pageEndIndex = currentPage * PAGE_SIZE
  const visibleInstruments = useMemo(
    () => instruments.slice(pageStartIndex, pageEndIndex),
    [instruments, pageEndIndex, pageStartIndex],
  )
  const startRow = instruments.length ? pageStartIndex + 1 : 0
  const endRow = Math.min(pageEndIndex, instruments.length)

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1))
  }

  function goToNextPage() {
    setPage((current) => Math.min(totalPages, current + 1))
  }

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
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {instruments.length} instruments
          </span>
          <StreamSubscriptionToggle />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <th className="px-6 py-4 font-semibold">Symbol</th>
              <th className="px-6 py-4 font-semibold">Bid</th>
              <th className="px-6 py-4 font-semibold">Ask</th>
              <th className="px-6 py-4 font-semibold">Close</th>
              <th className="px-6 py-4 font-semibold">Change</th>
              <th className="px-6 py-4 font-semibold">Updated</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleInstruments.map((instrument) => (
              <DashboardTableRow
                instrument={instrument}
                key={instrument.id}
              />
            ))}

            {instruments.length === 0 ? (
              <tr className="border-t border-slate-200/70 text-sm text-slate-500">
                <td className="px-6 py-8 text-center" colSpan={7}>
                  Waiting for instruments.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200/80 px-6 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {startRow}-{endRow} of {instruments.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
            type="button"
          >
            Previous
          </button>
          <span className="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
})
