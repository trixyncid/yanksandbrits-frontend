import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { AppProviders } from './app/providers/app-providers'
import { router } from './app/router'
import { AppToaster } from './shared/components/ui/sonner'
import './styles/globals.css'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      <AppToaster />
    </AppProviders>
  </StrictMode>,
)
