import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { getPortfolioPageData } from '../application/usecases/getPortfolioPageData'
import type { InstrumentRepository } from '../domain/repositories/InstrumentRepository'
import { staticPortfolioRepository } from '../infrastructure/repositories/StaticPortfolioRepository'
import { AuthLoadingScreen } from '../presentation/auth/AuthLoadingScreen'
import { useAuth } from '../presentation/auth/useAuth'
import { DashboardPage } from '../presentation/pages/dashboard/DashboardPage'
import { LoginPage } from '../presentation/pages/login/LoginPage'
import { PortfolioPage } from '../presentation/pages/portfolio/PortfolioPage'

const routeChangeEventName = 'app-route-change'

function getCurrentPath() {
  return window.location.pathname
}

function subscribeToRouteChange(callback: () => void) {
  window.addEventListener('popstate', callback)
  window.addEventListener(routeChangeEventName, callback)

  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(routeChangeEventName, callback)
  }
}

function emitRouteChange() {
  window.dispatchEvent(new Event(routeChangeEventName))
}

type AppProps = {
  instrumentRepository: InstrumentRepository
}

export default function App({ instrumentRepository }: AppProps) {
  const { isLoading, user } = useAuth()
  const path = useSyncExternalStore(
    subscribeToRouteChange,
    getCurrentPath,
    getCurrentPath,
  )

  const navigate = useCallback((to: string, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', to)
    } else {
      window.history.pushState(null, '', to)
    }

    emitRouteChange()
  }, [])

  const isDashboardRoute = path.startsWith('/dashboard')
  const isLoginRoute = path.startsWith('/login')

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (isDashboardRoute && !user) {
      navigate('/login', true)
    }

    if (isLoginRoute && user) {
      navigate('/dashboard', true)
    }
  }, [isDashboardRoute, isLoading, isLoginRoute, navigate, user])

  if (
    isLoading ||
    (isDashboardRoute && !user) ||
    (isLoginRoute && Boolean(user))
  ) {
    return <AuthLoadingScreen />
  }

  if (isLoginRoute) {
    return <LoginPage onSignedIn={() => navigate('/dashboard', true)} />
  }

  if (isDashboardRoute) {
    return (
      <DashboardPage
        instrumentRepository={instrumentRepository}
        onLoggedOut={() => navigate('/login', true)}
      />
    )
  }

  const portfolioPageData = getPortfolioPageData(staticPortfolioRepository)

  return <PortfolioPage data={portfolioPageData} />
}
