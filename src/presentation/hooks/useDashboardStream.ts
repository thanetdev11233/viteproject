import { startTransition, useEffect, useEffectEvent, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  DashboardConnectionState,
  DashboardRow,
} from '../../domain/entities/dashboard/dashboard'

const MAX_ROWS = 150
const dashboardRowsQueryKey = ['dashboard', 'rows'] as const

function formatTimestamp(date: Date) {
  return date.toISOString()
}

function createMockRow(index: number): DashboardRow {
  const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META']
  const symbol = symbols[index % symbols.length]
  const price = Number((120 + Math.random() * 880).toFixed(2))
  const change = Number(((Math.random() - 0.5) * 12).toFixed(2))
  const volume = Math.floor(5000 + Math.random() * 90000)

  return {
    id: symbol,
    symbol,
    price,
    change,
    volume,
    updatedAt: formatTimestamp(new Date()),
    status: change >= 0 ? 'up' : 'down',
  }
}

function createMockSeed() {
  return Array.from({ length: 8 }, (_, index) => createMockRow(index))
}

function mergeRows(currentRows: DashboardRow[], nextRows: DashboardRow[]) {
  const rowMap = new Map(currentRows.map((row) => [row.id, row]))

  nextRows.forEach((row) => {
    rowMap.set(row.id, row)
  })

  return Array.from(rowMap.values())
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
    .slice(0, MAX_ROWS)
}

type UseDashboardStreamOptions = {
  websocketUrl?: string
}

export function useDashboardStream({
  websocketUrl,
}: UseDashboardStreamOptions = {}) {
  const queryClient = useQueryClient()

  const { data: rows = [] } = useQuery({
    queryKey: dashboardRowsQueryKey,
    queryFn: async () => createMockSeed(),
    staleTime: Number.POSITIVE_INFINITY,
  })

  const applyRows = useEffectEvent((incomingRows: DashboardRow[]) => {
    if (!incomingRows.length) {
      return
    }

    startTransition(() => {
      queryClient.setQueryData<DashboardRow[]>(dashboardRowsQueryKey, (current) =>
        mergeRows(current ?? [], incomingRows),
      )
    })
  })

  useEffect(() => {
    // Current phase: mock transport only.
    // TanStack Query already owns the table state so a real WebSocket layer
    // can later replace this interval and write into the same cache key.
    const timer = window.setInterval(() => {
      applyRows([createMockRow(Math.floor(Math.random() * 6))])
    }, 1600)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const summary = useMemo(() => {
    const totalVolume = rows.reduce((sum, row) => sum + row.volume, 0)
    const positiveCount = rows.filter((row) => row.change >= 0).length
    const negativeCount = rows.filter((row) => row.change < 0).length

    return {
      totalRows: rows.length,
      totalVolume,
      positiveCount,
      negativeCount,
    }
  }, [rows])

  const connectionState: DashboardConnectionState = 'mock'

  return {
    rows,
    summary,
    connectionState,
    lastMessageAt: rows[0]?.updatedAt ?? null,
    errorMessage: null,
    isMock: true,
    websocketUrl,
  }
}
