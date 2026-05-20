import { createContext } from 'react'

import type { AuthUser } from '../../domain/models/auth'

export type AuthContextValue = {
  authError: string | null
  isLoading: boolean
  logout: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
