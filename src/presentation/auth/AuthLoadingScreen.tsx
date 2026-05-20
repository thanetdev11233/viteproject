import { Container } from '../components/ui/container/Container'

export function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center bg-canvas">
      <Container size="narrow">
        <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Loading
          </p>
          <p className="mt-3 text-base font-semibold text-slate-950">
            Preparing your session
          </p>
        </div>
      </Container>
    </main>
  )
}
