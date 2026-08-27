import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { refreshSession } from '../../features/auth/api/auth-api'
import { useAuthStore } from '../../features/auth/store/auth-store'

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshInFlight: Promise<void> | null = null

async function renewSession(): Promise<void> {
  const { rememberMe, clearSession } = useAuthStore.getState()

  try {
    await refreshSession(rememberMe)
  } catch (error) {
    clearSession()
    throw error
  }
}

function isPublicAppPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password')
  )
}

function redirectToLogin(): void {
  if (!isPublicAppPath(window.location.pathname)) {
    window.location.assign('/login')
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/me') ||
      original.url?.includes('/auth/forgot-password') ||
      original.url?.includes('/auth/reset-password')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshInFlight) {
        refreshInFlight = renewSession().finally(() => {
          refreshInFlight = null
        })
      }

      await refreshInFlight
      return httpClient.request(original)
    } catch {
      redirectToLogin()
      return Promise.reject(error)
    }
  },
)
