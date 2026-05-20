import type { InstrumentRepository } from '../../domain/repositories/InstrumentRepository'

export function getActiveInstruments(repository: InstrumentRepository) {
  return repository.getActiveInstruments()
}
