export type DashboardRow = {
  ask?: number
  bid?: number
  close?: number
  change: number
  id: string
  prev?: number
  price: number
  symbol: string
  updatedAt: string
  volume: number
  status?: string
}

export type DashboardQuoteMap = Record<string, DashboardRow>

export type DashboardConnectionState =
  | 'connecting'
  | 'open'
  | 'closed'
  | 'error'
  | 'mock'

export type DashboardMessage =
  | DashboardRow[]
  | {
      rows: DashboardRow[]
    }
  | {
      row: DashboardRow
    }
  | {
      type: 'snapshot'
      rows: DashboardRow[]
    }
  | {
      type: 'row'
      row: DashboardRow
    }
