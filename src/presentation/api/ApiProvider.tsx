import type { ReactNode } from 'react'

import type { ApiClient } from '../../domain/repositories/ApiClient'
import { ApiContext } from './ApiContext'

type ApiProviderProps = {
  children: ReactNode
  client: ApiClient
}

export function ApiProvider({ children, client }: ApiProviderProps) {
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
}
