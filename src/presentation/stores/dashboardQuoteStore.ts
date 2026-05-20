import type {
  DashboardQuoteMap,
  DashboardRow,
} from '../../domain/entities/dashboard/dashboard'

type DashboardQuoteField = keyof DashboardRow
type DashboardQuoteSummary = {
  negativeCount: number
  positiveCount: number
  totalRows: number
  totalVolume: number
}
export type DashboardQuoteSummaryField = keyof DashboardQuoteSummary
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
  private lastMessageAtListeners = new Set<StoreListener>()
  private quoteListeners = new Set<StoreListener>()
  private quotesById: DashboardQuoteMap = {}
  private rowsSnapshot: DashboardRow[] = []
  private lastMessageAtSnapshot: string | null = null
  private summaryFieldListeners = new Map<
    DashboardQuoteSummaryField,
    Set<StoreListener>
  >()
  private summaryListeners = new Set<StoreListener>()
  private summarySnapshot: DashboardQuoteSummary = {
    negativeCount: 0,
    positiveCount: 0,
    totalRows: 0,
    totalVolume: 0,
  }

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

  getLastMessageAtSnapshot() {
    return this.lastMessageAtSnapshot
  }

  getRow(id: string) {
    return this.quotesById[id]
  }

  getSummarySnapshot() {
    return this.summarySnapshot
  }

  getSummaryField(field: DashboardQuoteSummaryField) {
    return this.summarySnapshot[field]
  }

  subscribe(listener: StoreListener) {
    this.quoteListeners.add(listener)

    return () => {
      this.quoteListeners.delete(listener)
    }
  }

  subscribeLastMessageAt(listener: StoreListener) {
    this.lastMessageAtListeners.add(listener)

    return () => {
      this.lastMessageAtListeners.delete(listener)
    }
  }

  subscribeSummary(listener: StoreListener) {
    this.summaryListeners.add(listener)

    return () => {
      this.summaryListeners.delete(listener)
    }
  }

  subscribeSummaryField(
    field: DashboardQuoteSummaryField,
    listener: StoreListener,
  ) {
    const listeners =
      this.summaryFieldListeners.get(field) ?? new Set<StoreListener>()
    listeners.add(listener)
    this.summaryFieldListeners.set(field, listeners)

    return () => {
      listeners.delete(listener)

      if (listeners.size === 0) {
        this.summaryFieldListeners.delete(field)
      }
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

    const nextSummary = this.rowsSnapshot.reduce<DashboardQuoteSummary>(
      (summary, row) => ({
        negativeCount: summary.negativeCount + (row.change < 0 ? 1 : 0),
        positiveCount: summary.positiveCount + (row.change >= 0 ? 1 : 0),
        totalRows: summary.totalRows + 1,
        totalVolume: summary.totalVolume + row.volume,
      }),
      {
        negativeCount: 0,
        positiveCount: 0,
        totalRows: 0,
        totalVolume: 0,
      },
    )
    const nextLastMessageAt = this.rowsSnapshot[0]?.updatedAt ?? null
    const changedSummaryFields = (
      Object.keys(nextSummary) as DashboardQuoteSummaryField[]
    ).filter((field) => nextSummary[field] !== this.summarySnapshot[field])
    const summaryChanged = changedSummaryFields.length > 0
    const lastMessageAtChanged =
      nextLastMessageAt !== this.lastMessageAtSnapshot

    this.summarySnapshot = nextSummary
    this.lastMessageAtSnapshot = nextLastMessageAt

    changedFieldKeys.forEach((key) => {
      this.fieldListeners.get(key)?.forEach((listener) => listener())
    })

    this.quoteListeners.forEach((listener) => listener())

    if (summaryChanged) {
      this.summaryListeners.forEach((listener) => listener())
      changedSummaryFields.forEach((field) => {
        this.summaryFieldListeners.get(field)?.forEach((listener) => listener())
      })
    }

    if (lastMessageAtChanged) {
      this.lastMessageAtListeners.forEach((listener) => listener())
    }
  }
}

export const dashboardQuoteStore = new DashboardQuoteStore()
