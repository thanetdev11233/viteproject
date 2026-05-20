import type {
  DashboardQuoteMap,
  DashboardRow,
} from '../../domain/entities/dashboard/dashboard'

type DashboardQuoteField = keyof DashboardRow
type StoreListener = () => void

const quoteFields: DashboardQuoteField[] = [
  'ask',
  'bid',
  'change',
  'close',
  'id',
  'prev',
  'price',
  'status',
  'symbol',
  'updatedAt',
  'volume',
]

function getFieldKey(id: string, field: DashboardQuoteField) {
  return `${id}:${field}`
}

class DashboardQuoteStore {
  private fieldListeners = new Map<string, Set<StoreListener>>()
  private quoteListeners = new Set<StoreListener>()
  private quotesById: DashboardQuoteMap = {}
  private rowsSnapshot: DashboardRow[] = []

  getField<TField extends DashboardQuoteField>(
    id: string,
    fallbackId: string,
    field: TField,
  ) {
    return (this.quotesById[id] ?? this.quotesById[fallbackId])?.[field]
  }

  getRowsSnapshot() {
    return this.rowsSnapshot
  }

  getRow(id: string) {
    return this.quotesById[id]
  }

  subscribe(listener: StoreListener) {
    this.quoteListeners.add(listener)

    return () => {
      this.quoteListeners.delete(listener)
    }
  }

  subscribeField(
    id: string,
    fallbackId: string,
    field: DashboardQuoteField,
    listener: StoreListener,
  ) {
    const keys = [getFieldKey(id, field)]

    if (fallbackId !== id) {
      keys.push(getFieldKey(fallbackId, field))
    }

    keys.forEach((key) => {
      const listeners = this.fieldListeners.get(key) ?? new Set<StoreListener>()
      listeners.add(listener)
      this.fieldListeners.set(key, listeners)
    })

    return () => {
      keys.forEach((key) => {
        const listeners = this.fieldListeners.get(key)
        listeners?.delete(listener)

        if (listeners?.size === 0) {
          this.fieldListeners.delete(key)
        }
      })
    }
  }

  upsertRows(rows: DashboardRow[]) {
    const changedFieldKeys = new Set<string>()
    let hasChanges = false

    rows.forEach((row) => {
      const currentRow = this.quotesById[row.id]

      quoteFields.forEach((field) => {
        if (!Object.is(currentRow?.[field], row[field])) {
          changedFieldKeys.add(getFieldKey(row.id, field))
          hasChanges = true
        }
      })

      if (currentRow !== row) {
        this.quotesById = {
          ...this.quotesById,
          [row.id]: row,
        }
      }
    })

    if (!hasChanges) {
      return
    }

    this.rowsSnapshot = Object.values(this.quotesById).sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )

    changedFieldKeys.forEach((key) => {
      this.fieldListeners.get(key)?.forEach((listener) => listener())
    })

    this.quoteListeners.forEach((listener) => listener())
  }
}

export const dashboardQuoteStore = new DashboardQuoteStore()
