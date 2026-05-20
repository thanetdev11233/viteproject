import { FirebaseError } from 'firebase/app'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'

import type { AuthUser } from '../../domain/models/auth'
import type {
  AuthRepository,
  AuthStateUnsubscribe,
} from '../../domain/repositories/AuthRepository'
import { getFirebaseAuth } from '../firebase/firebaseClient'

function toAuthUser(user: User): AuthUser {
  return {
    displayName: user.displayName,
    email: user.email,
    uid: user.uid,
  }
}

function normalizeFirebaseAuthError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      return new Error('Email or password is incorrect.')
    }

    if (error.code === 'auth/too-many-requests') {
      return new Error('Too many login attempts. Please try again later.')
    }

    if (error.code === 'auth/invalid-email') {
      return new Error('Please enter a valid email address.')
    }
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Unable to sign in. Please try again.')
}

class FirebaseAuthRepository implements AuthRepository {
  async getIdToken(): Promise<string | null> {
    return getFirebaseAuth().currentUser?.getIdToken() ?? null
  }

  listen(
    callback: (user: AuthUser | null) => void,
    onError?: (error: Error) => void,
  ): AuthStateUnsubscribe {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (user) => {
        callback(user ? toAuthUser(user) : null)
      })
    } catch (error) {
      queueMicrotask(() => {
        onError?.(error instanceof Error ? error : new Error('Auth is unavailable.'))
      })

      return () => undefined
    }
  }

  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      )

      return toAuthUser(credential.user)
    } catch (error) {
      throw normalizeFirebaseAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth())
  }
}

export const firebaseAuthRepository = new FirebaseAuthRepository()
