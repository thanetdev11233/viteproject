import { createContext, useContext } from 'react'

type StoreListener = () => void

export type DashboardStreamControlSnapshot = {
  canToggleSubscription: boolean
  isSubscribed: boolean
  subscriptionData: string
}

export type DashboardStreamControlField = keyof DashboardStreamControlSnapshot

type DashboardStreamControlHandlers = {
  subscribe: () => void
  unsubscribe: () => void
}

const emptyHandlers: DashboardStreamControlHandlers = {
  subscribe: () => undefined,
  unsubscribe: () => undefined,
}

const initialSnapshot: DashboardStreamControlSnapshot = {
  canToggleSubscription: false,
  isSubscribed: true,
  subscriptionData: '',
}

export class DashboardStreamControlStore {
  private fieldListeners = new Map<
    DashboardStreamControlField,
    Set<StoreListener>
  >()
  private handlers = emptyHandlers
  private listeners = new Set<StoreListener>()
  private snapshot = initialSnapshot

  getField = <TField extends DashboardStreamControlField>(field: TField) =>
    this.snapshot[field]

  getSnapshot = () => this.snapshot

  setHandlers(handlers: DashboardStreamControlHandlers) {
    this.handlers = handlers
  }

  setSnapshot(snapshot: DashboardStreamControlSnapshot) {
    if (
      snapshot.canToggleSubscription === this.snapshot.canToggleSubscription &&
      snapshot.isSubscribed === this.snapshot.isSubscribed &&
      snapshot.subscriptionData === this.snapshot.subscriptionData
    ) {
      return
    }

    const changedFields = (
      Object.keys(snapshot) as DashboardStreamControlField[]
    ).filter((field) => snapshot[field] !== this.snapshot[field])

    this.snapshot = snapshot
    changedFields.forEach((field) => {
      this.fieldListeners.get(field)?.forEach((listener) => listener())
    })
    this.listeners.forEach((listener) => listener())
  }

  subscribe = (listener: StoreListener) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  subscribeField = (
    field: DashboardStreamControlField,
    listener: StoreListener,
  ) => {
    const listeners =
      this.fieldListeners.get(field) ?? new Set<StoreListener>()
    listeners.add(listener)
    this.fieldListeners.set(field, listeners)

    return () => {
      listeners.delete(listener)

      if (listeners.size === 0) {
        this.fieldListeners.delete(field)
      }
    }
  }

  subscribeStream = () => {
    this.handlers.subscribe()
  }

  unsubscribeStream = () => {
    this.handlers.unsubscribe()
  }
}

export const DashboardStreamControlContext =
  createContext<DashboardStreamControlStore | null>(null)

export const DashboardStreamControlProvider =
  DashboardStreamControlContext.Provider

export function useDashboardStreamControlStore() {
  const context = useContext(DashboardStreamControlContext)

  if (!context) {
    throw new Error(
      'useDashboardStreamControlStore must be used within DashboardStreamControlProvider.',
    )
  }

  return context
}
