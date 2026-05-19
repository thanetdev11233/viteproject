export type DashboardRow = {
  id: string
  symbol: string
  price: number
  change: number
  volume: number
  updatedAt: string
  status?: string
}

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
