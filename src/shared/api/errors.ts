import axios from 'axios'

import type { ApiErrorBody } from './types'

function firstDetailMessage(details: unknown): string | null {
  if (!details || typeof details !== 'object') {
    return null
  }

  for (const value of Object.values(details as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
      return value[0]
    }
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return null
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) return error.message
    return fallback
  }

  const data = error.response?.data as ApiErrorBody | undefined
  const detailMessage = firstDetailMessage(data?.details)
  if (detailMessage) {
    return detailMessage
  }

  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  return fallback
}
