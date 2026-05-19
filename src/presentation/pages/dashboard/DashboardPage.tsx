import { Container } from '../../components/ui/container/Container'
import { DashboardDataTable } from '../../components/dashboard/DashboardDataTable'
import { useDashboardStream } from '../../hooks/useDashboardStream'

const websocketUrl = import.meta.env.VITE_DASHBOARD_WS_URL as string | undefined

function SummaryCard({
  eyebrow,
  title,
  value,
}: {
  eyebrow: string
  title: string
  value: string
}) {
  return (
    <article className="rounded-[28px] border border-white/65 bg-white/82 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-sm font-medium text-slate-500">{title}</h2>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  )
}

function ConnectionBadge({
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
}

export function DashboardPage() {
  const { connectionState, errorMessage, isMock, lastMessageAt, rows, summary } =
    useDashboardStream({ websocketUrl })

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_26%),linear-gradient(180deg,_#f7f9fc_0%,_#edf3fb_100%)] pb-16 text-slate-900">
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
                This page is prepared for a live WebSocket feed, but the current
                implementation is still using mockup streaming data managed with
                TanStack Query.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <ConnectionBadge isMock={isMock} state={connectionState} />
              <p className="text-sm text-slate-500">
                {lastMessageAt
                  ? `Last update ${new Date(lastMessageAt).toLocaleTimeString()}`
                  : 'Waiting for first message'}
              </p>
              <a
                className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950"
                href="/"
              >
                Back to portfolio
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              eyebrow="Rows"
              title="Tracked instruments"
              value={summary.totalRows.toString()}
            />
            <SummaryCard
              eyebrow="Volume"
              title="Aggregated feed volume"
              value={summary.totalVolume.toLocaleString()}
            />
            <SummaryCard
              eyebrow="Positive"
              title="Instruments trending up"
              value={summary.positiveCount.toString()}
            />
            <SummaryCard
              eyebrow="Negative"
              title="Instruments trending down"
              value={summary.negativeCount.toString()}
            />
          </div>

          <div className="mt-8">
            <DashboardDataTable rows={rows} />
          </div>

          {errorMessage ? (
            <section className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                Connection issue
              </p>
              <p className="mt-3 text-sm leading-7">{errorMessage}</p>
            </section>
          ) : null}
        </div>
      </Container>
    </div>
  )
}
