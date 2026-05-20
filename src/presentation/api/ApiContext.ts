import { createContext } from 'react'

import type { ApiClient } from '../../domain/repositories/ApiClient'

export const ApiContext = createContext<ApiClient | null>(null)
