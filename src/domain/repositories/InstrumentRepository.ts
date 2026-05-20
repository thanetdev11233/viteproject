import type { InstrumentSlim } from '../models/instrument'

export type InstrumentRepository = {
  getActiveInstruments(): Promise<InstrumentSlim[]>
}
