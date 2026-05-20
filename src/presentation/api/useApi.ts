import { useContext } from 'react'

import { ApiContext } from './ApiContext'

export function useApi() {
  const client = useContext(ApiContext)

  if (!client) {
    throw new Error('useApi must be used within ApiProvider.')
  }

  return client
}
