import { useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/ui/button/Button'
import { Container } from '../../components/ui/container/Container'

type LoginPageProps = {
  onSignedIn: () => void
}

export function LoginPage({ onSignedIn }: LoginPageProps) {
  const { authError, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await signIn(email.trim(), password)
      onSignedIn()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleError = errorMessage ?? authError

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f9faff_0%,_#eef4fb_100%)] py-10 text-slate-950">
      <Container className="flex min-h-[calc(100vh-5rem)] items-center" size="narrow">
        <section className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:grid-cols-[0.95fr_1.05fr]">
          <div className="flex min-h-64 flex-col justify-between bg-slate-950 p-8 text-white sm:p-10">
            <div>
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.28em] text-brand-yellow">
                Firebase Auth
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
                Dashboard login
              </h1>
            </div>
            <p className="mt-10 max-w-sm text-sm leading-6 text-slate-300">
              Sign in with the email and password registered in Firebase
              Authentication.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-sm font-semibold text-slate-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  autoComplete="email"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950"
                  id="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div>
                <label
                  className="text-sm font-semibold text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  autoComplete="current-password"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950"
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                />
              </div>

              {visibleError ? (
                <p
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
                  role="alert"
                >
                  {visibleError}
                </p>
              ) : null}

              <Button disabled={isSubmitting} fullWidth type="submit">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <a
              className="mt-6 inline-flex text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950"
              href="/"
            >
              Back to portfolio
            </a>
          </div>
        </section>
      </Container>
    </main>
  )
}
