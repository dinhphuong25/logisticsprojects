import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { queryClient } from './lib/queryClient'
import i18n from './lib/i18n'
import { ErrorBoundary } from './components/ErrorBoundary'
import { OfflineIndicator } from './components/OfflineIndicator'
import App from './App'
import './index.css'
import './responsive.css'

// Initialize MirageJS mock server (works in both dev and production)
import('./mocks/server').then(({ makeServer }) => {
  makeServer()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <App />
          <OfflineIndicator />
        </I18nextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
