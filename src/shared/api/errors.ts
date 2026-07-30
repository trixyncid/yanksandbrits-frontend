import axios from 'axios'

import type { ApiErrorBody } from './types'

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) return error.message
    return fallback
  }

  const data = error.response?.data as ApiErrorBody | undefined
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (data?.details && typeof data.details === 'object' && data.details !== null) {
    const details = data.details as Record<string, unknown>
    for (const value of Object.values(details)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0]
      }
      if (typeof value === 'string') {
        return value
      }
    }
  }

  return fallback
}
