import { memo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import type { InstrumentRepository } from '../../../domain/repositories/InstrumentRepository'
import { useAuth } from '../../auth/useAuth'
import { Container } from '../../components/ui/container/Container'
import { DashboardDataTable } from '../../components/dashboard/DashboardDataTable'
import { DashboardStreamControlProvider } from '../../dashboard/DashboardStreamControlContext'
import { useActiveInstruments } from '../../hooks/useActiveInstruments'
import { useDashboardStream } from '../../hooks/useDashboardStream'
import {
  dashboardQuoteStore,
  type DashboardQuoteSummaryField,
} from '../../stores/dashboardQuoteStore'

const dashboardWebsocketUrl =
  (import.meta.env.VITE_DASHBOARD_WS_URL as string | undefined) ??
  'wss://ws-invest-dev.iuxsecure.com/api/v1/streamer'

type DashboardPageProps = {
  instrumentRepository: InstrumentRepository
  onLoggedOut: () => void
}

const SummaryCard = memo(function SummaryCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <article className="rounded-[28px] border border-white/65 bg-white/82 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-sm font-medium text-slate-500">{title}</h2>
      {children}
    </article>
  )
})

const SummaryValue = memo(function SummaryValue({
  value,
}: {
  value: number
}) {
  return (
    <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
      {value}
    </p>
  )
})

const SummaryMetricValue = memo(function SummaryMetricValue({
  field,
}: {
  field: DashboardQuoteSummaryField
}) {
  const value = useSyncExternalStore(
    (listener) => dashboardQuoteStore.subscribeSummaryField(field, listener),
    () => dashboardQuoteStore.getSummaryField(field),
    () => 0,
  )

  return <SummaryValue value={value} />
})

const ConnectionBadge = memo(function ConnectionBadge({
  state,
  isMock,
}: {
  state: string
  isMock: boolean
}) {
  const styles = {
    connecting: 'bg-amber-100 text-amber-700',
    open: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-200 text-slate-700',
    error: 'bg-rose-100 text-rose-700',
    mock: 'bg-sky-100 text-sky-700',
  } as const

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
        styles[state as keyof typeof styles] ?? styles.closed
      }`}
    >
      {isMock ? 'mock feed' : state}
    </span>
  )
})

const LastUpdateLabel = memo(function LastUpdateLabel() {
  const lastMessageAt = useSyncExternalStore(
    (listener) => dashboardQuoteStore.subscribeLastMessageAt(listener),
    () => dashboardQuoteStore.getLastMessageAtSnapshot(),
    () => null,
  )

  return (
    <p className="text-sm text-slate-500">
      {lastMessageAt
        ? `Last update ${new Date(lastMessageAt).toLocaleTimeString()}`
        : 'Waiting for first message'}
    </p>
  )
})

const DashboardSummaryCards = memo(function DashboardSummaryCards({
  instrumentCount,
}: {
  instrumentCount: number
}) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        eyebrow="Rows"
        title="Tracked instruments"
      >
        <SummaryValue value={instrumentCount} />
      </SummaryCard>
      <SummaryCard
        eyebrow="Quotes"
        title="Live quote updates"
      >
        <SummaryMetricValue field="totalRows" />
      </SummaryCard>
      <SummaryCard
        eyebrow="Positive"
        title="Instruments trending up"
      >
        <SummaryMetricValue field="positiveCount" />
      </SummaryCard>
      <SummaryCard
        eyebrow="Negative"
        title="Instruments trending down"
      >
        <SummaryMetricValue field="negativeCount" />
      </SummaryCard>
    </div>
  )
})

export function DashboardPage({
  instrumentRepository,
  onLoggedOut,
}: DashboardPageProps) {
  const { logout, user } = useAuth()
  const {
    data: instruments = [],
    error: instrumentsError,
  } = useActiveInstruments(instrumentRepository)
  const {
    connectionState,
    isMock,
    streamControlStore,
  } = useDashboardStream({
    instruments,
    websocketUrl: dashboardWebsocketUrl,
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  async function handleLogout() {
    setLogoutError(null)
    setIsLoggingOut(true)

    try {
      await logout()
      onLoggedOut()
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to sign out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen .bg-\[radial-gradient\(circle_at_top_left\,_rgba\(56\,189\,248\,0\.25\)\,_transparent_26\%\)\,linear-gradient\(180deg\,_\#f7f9fc_0\%\,_\#edf3fb_100\%\)\] {
    background-image: radial-gradient(circle at top left, rgba(56,189,248,0.25), transparent 26%),linear-gradient(180deg, #f7f9fc 0%, #edf3fb 100%);
} pb-16 text-slate-900">
      <Container className="pt-8 sm:pt-10 lg:pt-12" size="wide">
        <div className="rounded-[36px] border border-white/60 bg-white/55 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">
                Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Realtime data table from WebSocket
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                This page is prepared for a live WebSocket feed, while the
                instruments API is requested with the Firebase ID token.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <ConnectionBadge isMock={isMock} state={connectionState} />
              {user?.email ? (
                <p className="text-sm text-slate-500">Signed in as {user.email}</p>
              ) : null}
              <LastUpdateLabel />
              <a
                className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950"
                href="/"
              >
                Back to portfolio
              </a>
              <button
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
                type="button"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
              {logoutError ? (
                <p className="max-w-xs text-sm leading-6 text-rose-600">
                  {logoutError}
                </p>
              ) : null}
            </div>
          </div>

          <DashboardSummaryCards instrumentCount={instruments.length} />

          {instrumentsError ? (
            <section className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                Instruments API issue
              </p>
              <p className="mt-3 text-sm leading-7">
                {instrumentsError instanceof Error
                  ? instrumentsError.message
                  : 'Unable to load instruments.'}
              </p>
            </section>
          ) : null}

          <div className="mt-8">
            <DashboardStreamControlProvider value={streamControlStore}>
              <DashboardDataTable instruments={instruments} />
            </DashboardStreamControlProvider>
          </div>
        </div>
      </Container>
    </div>
  )
}
