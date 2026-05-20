import { useQuery } from '@tanstack/react-query'

import { getActiveInstruments } from '../../application/usecases/getActiveInstruments'
import type { InstrumentRepository } from '../../domain/repositories/InstrumentRepository'

export const activeInstrumentsQueryKey = ['instruments', 'active'] as const

export function useActiveInstruments(repository: InstrumentRepository) {
  return useQuery({
    queryKey: activeInstrumentsQueryKey,
    queryFn: () => getActiveInstruments(repository),
  })
}
