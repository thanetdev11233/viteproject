import type { InstrumentSlim } from '../../domain/models/instrument'
import type { ApiClient } from '../../domain/repositories/ApiClient'
import type { InstrumentRepository } from '../../domain/repositories/InstrumentRepository'

const activeInstrumentsPath = '/v1/instruments/slim/filter?active=true'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getStringField(
  value: Record<string, unknown>,
  keys: string[],
): string | null {
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

function getBooleanField(
  value: Record<string, unknown>,
  keys: string[],
): boolean | null {
  for (const key of keys) {
    const field = value[key]

    if (typeof field === 'boolean') {
      return field
    }
  }

  return null
}

function getNumberField(
  value: Record<string, unknown>,
  keys: string[],
): number | null {
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

function getStringArrayField(
  value: Record<string, unknown>,
  keys: string[],
): string[] {
  for (const key of keys) {
    const field = value[key]

    if (Array.isArray(field)) {
      return field.filter((item): item is string => typeof item === 'string')
    }
  }

  return []
}

function getCollection(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response
  }

  if (!isRecord(response)) {
    return []
  }

  const candidates = [
    response.data,
    response.instruments,
    response.items,
    response.results,
    response.rows,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function toInstrumentSlim(value: unknown, index: number): InstrumentSlim | null {
  if (!isRecord(value)) {
    return null
  }

  const id =
    getStringField(value, ['id', 'instrumentId', 'instrument_id', 'uid']) ??
    `instrument-${index}`
  const symbol =
    getStringField(value, ['symbol', 'ticker', 'code', 'name']) ?? id

  return {
    active: getBooleanField(value, ['active', 'isActive', 'is_active']),
    assetBase: getStringField(value, ['assetBase', 'asset_base']),
    assetQuote: getStringField(value, ['assetQuote', 'asset_quote']),
    categories: getStringArrayField(value, ['categories']),
    createdAt: getStringField(value, ['createdAt', 'created_at']),
    digit: getNumberField(value, ['digit', 'digits']),
    exchange: getStringField(value, [
      'exchange',
      'exchangeId',
      'exchange_id',
      'exchangeCode',
      'exchange_code',
    ]),
    id,
    industry: getStringField(value, ['industry']),
    isIn: getStringField(value, ['isIn', 'is_in']),
    marketCap: getNumberField(value, ['marketCap', 'market_cap']),
    name: getStringField(value, ['name', 'displayName', 'display_name']),
    picture: getStringField(value, ['picture', 'image', 'icon']),
    raw: value,
    sector: getStringField(value, ['sector']),
    symbol,
    takerSymbol: getStringField(value, ['takerSymbol', 'taker_symbol']),
    topMarket: getBooleanField(value, ['topMarket', 'top_market']),
    tradeSymbol: getStringField(value, ['tradeSymbol', 'trade_symbol']),
    type: getStringField(value, ['type', 'instrumentType', 'instrument_type']),
  }
}

export class HttpInstrumentRepository implements InstrumentRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async getActiveInstruments(): Promise<InstrumentSlim[]> {
    const response = await this.apiClient.get<unknown>(activeInstrumentsPath, {
      headers: {
        'auth-provider': 'firebase',
        'auth-type': 'client',
        language: 'en',
      },
    })

    return getCollection(response)
      .map((item, index) => toInstrumentSlim(item, index))
      .filter((item): item is InstrumentSlim => Boolean(item))
  }
}
