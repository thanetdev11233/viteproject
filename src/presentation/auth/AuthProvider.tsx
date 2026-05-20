import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { AuthUser } from '../../domain/models/auth'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import { AuthContext, type AuthContextValue } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
  repository: AuthRepository
}

export function AuthProvider({ children, repository }: AuthProviderProps) {
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    return repository.listen(
      (nextUser) => {
        setUser(nextUser)
        setAuthError(null)
        setIsLoading(false)
      },
      (error) => {
        setAuthError(error.message)
        setIsLoading(false)
      },
    )
  }, [repository])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null)

      try {
        const nextUser = await repository.signInWithEmailAndPassword(
          email,
          password,
        )
        setUser(nextUser)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to sign in.'
        setAuthError(message)
        throw new Error(message, { cause: error })
      }
    },
    [repository],
  )

  const logout = useCallback(async () => {
    setAuthError(null)
    await repository.signOut()
    setUser(null)
  }, [repository])

  const value = useMemo<AuthContextValue>(
    () => ({
      authError,
      isLoading,
      logout,
      signIn,
      user,
    }),
    [authError, isLoading, logout, signIn, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
