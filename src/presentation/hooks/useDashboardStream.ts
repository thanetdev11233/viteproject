import {
  useCallback,
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  DashboardConnectionState,
  DashboardRow,
} from '../../domain/entities/dashboard/dashboard'
import type { InstrumentSlim } from '../../domain/models/instrument'
import { DashboardStreamControlStore } from '../dashboard/DashboardStreamControlContext'
import { dashboardQuoteStore } from '../stores/dashboardQuoteStore'

const RECONNECT_DELAY_MS = 2500

type DashboardRowPatch = Partial<DashboardRow> & {
  id: string
}

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
    ask: Number((price + 0.02).toFixed(2)),
    bid: Number((price - 0.02).toFixed(2)),
    close: price,
    id: symbol,
    prev: Number((price / (1 + change / 100)).toFixed(2)),
    symbol,
    price,
    change,
    volume,
    updatedAt: formatTimestamp(new Date()),
    status: change >= 0 ? 'up' : 'down',
  }
}

function debugStream(label: string, payload?: unknown) {
  if (import.meta.env.DEV) {
    console.debug(`[dashboard-ws] ${label}`, payload ?? '')
  }
}

function mergeRowPatches(nextRows: DashboardRowPatch[]) {
  return nextRows.map((row) => {
    const currentRow = dashboardQuoteStore.getRow(row.id)

    return {
      ask: row.ask ?? currentRow?.ask,
      bid: row.bid ?? currentRow?.bid,
      close: row.close ?? currentRow?.close,
      id: row.id,
      prev: row.prev ?? currentRow?.prev,
      symbol: row.symbol ?? currentRow?.symbol ?? row.id,
      price: row.price ?? currentRow?.price ?? 0,
      change: row.change ?? currentRow?.change ?? 0,
      volume: row.volume ?? currentRow?.volume ?? 0,
      updatedAt: row.updatedAt ?? currentRow?.updatedAt ?? formatTimestamp(new Date()),
      status: row.status ?? currentRow?.status,
    }
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

function getStringField(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const field = value[key]

    if (typeof field === 'string' && field.trim()) {
      return field
    }

    if (typeof field === 'number') {
      return field.toString()
    }
  }

  return null
}

function getNumberField(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const field = value[key]

    if (typeof field === 'number' && Number.isFinite(field)) {
      return field
    }

    if (typeof field === 'string' && field.trim()) {
      const parsed = Number(field)

      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}

function getTimestampField(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const field = value[key]

    if (typeof field === 'number' && Number.isFinite(field)) {
      const timestamp = field > 1_000_000_000_000 ? field : field * 1000

      return formatTimestamp(new Date(timestamp))
    }

    if (typeof field === 'string' && field.trim()) {
      const numericTimestamp = Number(field)

      if (Number.isFinite(numericTimestamp)) {
        const timestamp =
          numericTimestamp > 1_000_000_000_000
            ? numericTimestamp
            : numericTimestamp * 1000

        return formatTimestamp(new Date(timestamp))
      }

      const date = new Date(field)

      if (!Number.isNaN(date.getTime())) {
        return formatTimestamp(date)
      }
    }
  }

  return null
}

function getPayloadRows(payload: unknown): unknown[] {
  if (typeof payload === 'string') {
    const parsedPayload = parseJson(payload)

    return parsedPayload === payload ? [] : getPayloadRows(parsedPayload)
  }

  if (Array.isArray(payload)) {
    return payload
  }

  if (!isRecord(payload)) {
    return []
  }

  if (Array.isArray(payload.rows)) {
    return payload.rows
  }

  if (isRecord(payload.row)) {
    return [payload.row]
  }

  if (payload.data !== undefined) {
    return getPayloadRows(payload.data)
  }

  return [payload]
}

function toDashboardRowPatch(
  value: unknown,
  instrumentSymbolById: Map<string, string>,
): DashboardRowPatch | null {
  if (!isRecord(value)) {
    return null
  }

  const id = getStringField(value, [
    'id',
    'instrumentId',
    'instrument_id',
    'uid',
    'symbol',
  ])

  if (!id) {
    return null
  }

  const symbol =
    getStringField(value, ['symbol', 'ticker', 'code']) ??
    instrumentSymbolById.get(id) ??
    id
  const ask = getNumberField(value, ['ask', 'askS'])
  const bid = getNumberField(value, ['bid', 'bidS'])
  const close = getNumberField(value, ['close', 'price', 'lastPrice', 'last_price', 'last'])
  const prev = getNumberField(value, ['prev', 'previousClose', 'previous_close'])
  const price = close ?? bid ?? ask
  const explicitChange = getNumberField(value, [
    'change',
    'changePercent',
    'change_percent',
    'percentChange',
    'percent_change',
  ])
  const change =
    explicitChange ??
    (price !== null && prev !== null && prev !== 0
      ? Number((((price - prev) / prev) * 100).toFixed(2))
      : null)
  const volume = getNumberField(value, ['volume', 'vol', 'quoteVolume', 'quote_volume'])
  const updatedAt = getTimestampField(value, [
    'ts',
    'updatedAt',
    'updated_at',
    'timestamp',
    'time',
  ])
  const status = getStringField(value, ['status'])

  return {
    ask: ask ?? undefined,
    bid: bid ?? undefined,
    close: close ?? undefined,
    id,
    prev: prev ?? undefined,
    symbol,
    price: price ?? undefined,
    change: change ?? undefined,
    volume: volume ?? undefined,
    updatedAt: updatedAt ?? formatTimestamp(new Date()),
    status: status ?? (change === null ? undefined : change >= 0 ? 'up' : 'down'),
  }
}

function parseDashboardRows(
  message: MessageEvent<string>,
  instrumentSymbolById: Map<string, string>,
) {
  const payload = parseJson(message.data)

  debugStream('message', payload)

  return getPayloadRows(payload)
    .map((row) => toDashboardRowPatch(row, instrumentSymbolById))
    .filter((row): row is DashboardRowPatch => Boolean(row))
}

type UseDashboardStreamOptions = {
  instruments?: InstrumentSlim[]
  websocketUrl?: string
}

export function useDashboardStream({
  instruments = [],
  websocketUrl,
}: UseDashboardStreamOptions = {}) {
  const [connectionState, setConnectionState] =
    useState<DashboardConnectionState>(websocketUrl ? 'connecting' : 'mock')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isSubscribedRef = useRef(true)
  const socketRef = useRef<WebSocket | null>(null)
  const [streamControlStore] = useState(() => new DashboardStreamControlStore())

  const instrumentIds = useMemo(
    () => instruments.map((instrument) => instrument.id).filter(Boolean).sort(),
    [instruments],
  )
  const instrumentSymbolById = useMemo(
    () =>
      new Map(
        instruments.map((instrument) => [instrument.id, instrument.symbol] as const),
      ),
    [instruments],
  )
  const subscriptionData = instrumentIds.join(',')

  const applyRows = useEffectEvent((incomingRows: DashboardRowPatch[]) => {
    if (!incomingRows.length) {
      return
    }

    startTransition(() => {
      dashboardQuoteStore.upsertRows(mergeRowPatches(incomingRows))
    })
  })

  const parseAndApplyMessage = useEffectEvent((message: MessageEvent<string>) => {
    applyRows(parseDashboardRows(message, instrumentSymbolById))
  })

  const sendSubscriptionEvent = useCallback(
    (event: 'subscribe' | 'unsubscribe') => {
      const socket = socketRef.current

      if (!subscriptionData || socket?.readyState !== WebSocket.OPEN) {
        return
      }

      debugStream(event, subscriptionData)
      socket.send(
        JSON.stringify({
          event,
          data: subscriptionData,
        }),
      )
    },
    [subscriptionData],
  )

  const subscribe = useCallback(() => {
    isSubscribedRef.current = true
    sendSubscriptionEvent('subscribe')
    const currentSnapshot = streamControlStore.getSnapshot()
    streamControlStore.setSnapshot({
      canToggleSubscription: currentSnapshot.canToggleSubscription,
      isSubscribed: true,
      subscriptionData: currentSnapshot.subscriptionData || subscriptionData,
    })
  }, [sendSubscriptionEvent, streamControlStore, subscriptionData])

  const unsubscribe = useCallback(() => {
    isSubscribedRef.current = false
    sendSubscriptionEvent('unsubscribe')
    const currentSnapshot = streamControlStore.getSnapshot()
    streamControlStore.setSnapshot({
      canToggleSubscription: currentSnapshot.canToggleSubscription,
      isSubscribed: false,
      subscriptionData: currentSnapshot.subscriptionData || subscriptionData,
    })
  }, [sendSubscriptionEvent, streamControlStore, subscriptionData])

  useEffect(() => {
    if (websocketUrl) {
      return
    }

    const timer = window.setInterval(() => {
      applyRows([createMockRow(Math.floor(Math.random() * 6))])
    }, 1600)

    return () => {
      window.clearInterval(timer)
    }
  }, [websocketUrl])

  useEffect(() => {
    if (!websocketUrl) {
      return
    }

    if (!subscriptionData) {
      return
    }

    const streamUrl = websocketUrl
    let reconnectTimer: number | undefined
    let shouldReconnect = true

    function connect() {
      setConnectionState('connecting')
      setErrorMessage(null)

      const socket = new WebSocket(streamUrl)
      socketRef.current = socket

      socket.addEventListener('open', () => {
        setConnectionState('open')
        debugStream('open', streamUrl)

        if (isSubscribedRef.current) {
          debugStream('subscribe', subscriptionData)
          socket.send(
            JSON.stringify({
              event: 'subscribe',
              data: subscriptionData,
            }),
          )
        }
      })

      socket.addEventListener('message', parseAndApplyMessage)

      socket.addEventListener('error', () => {
        setConnectionState('error')
        debugStream('error')
        setErrorMessage('Unable to connect to realtime market stream.')
      })

      socket.addEventListener('close', () => {
        setConnectionState('closed')
        debugStream('closed')

        if (shouldReconnect) {
          reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS)
        }
      })
    }

    connect()

    return () => {
      shouldReconnect = false

      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer)
      }

      const socket = socketRef.current

      if (isSubscribedRef.current && socket?.readyState === WebSocket.OPEN) {
        debugStream('unsubscribe', subscriptionData)
        socket.send(
          JSON.stringify({
            event: 'unsubscribe',
            data: subscriptionData,
          }),
        )
      }

      socket?.close()

      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [subscriptionData, websocketUrl])

  const effectiveConnectionState: DashboardConnectionState = !websocketUrl
    ? 'mock'
    : subscriptionData
      ? connectionState
      : 'closed'
  const effectiveErrorMessage = subscriptionData ? errorMessage : null

  useEffect(() => {
    streamControlStore.setHandlers({
      subscribe,
      unsubscribe,
    })
  }, [streamControlStore, subscribe, unsubscribe])

  useEffect(() => {
    streamControlStore.setSnapshot({
      canToggleSubscription:
        Boolean(websocketUrl) &&
        Boolean(subscriptionData) &&
        effectiveConnectionState === 'open',
      isSubscribed: isSubscribedRef.current,
      subscriptionData,
    })
  }, [effectiveConnectionState, streamControlStore, subscriptionData, websocketUrl])

  return {
    streamControlStore,
    connectionState: effectiveConnectionState,
    errorMessage: effectiveErrorMessage,
    isMock: !websocketUrl,
    websocketUrl,
  }
}
