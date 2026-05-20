import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './app/App.tsx'
import { HttpApiClient } from './infrastructure/api/HttpApiClient.ts'
import { firebaseAuthRepository } from './infrastructure/repositories/FirebaseAuthRepository.ts'
import { HttpInstrumentRepository } from './infrastructure/repositories/HttpInstrumentRepository.ts'
import { ApiProvider } from './presentation/api/ApiProvider.tsx'
import { AuthProvider } from './presentation/auth/AuthProvider.tsx'
import './styles/globals.css'

const queryClient = new QueryClient()
const defaultApiBaseUrl = 'https://api-invest-dev.iuxsecure.com'
const apiClient = new HttpApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  getIdToken: () => firebaseAuthRepository.getIdToken(),
})
const instrumentRepository = new HttpInstrumentRepository(apiClient)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider repository={firebaseAuthRepository}>
        <ApiProvider client={apiClient}>
          <App instrumentRepository={instrumentRepository} />
        </ApiProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
