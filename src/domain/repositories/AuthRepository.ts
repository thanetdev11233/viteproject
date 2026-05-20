import type { AuthUser } from '../models/auth'

export type AuthStateUnsubscribe = () => void

export type AuthRepository = {
  getIdToken(): Promise<string | null>
  listen(
    callback: (user: AuthUser | null) => void,
    onError?: (error: Error) => void,
  ): AuthStateUnsubscribe
  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<AuthUser>
  signOut(): Promise<void>
}
