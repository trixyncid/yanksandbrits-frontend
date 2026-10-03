import { useCallback, useState } from 'react'

function readSessionValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.sessionStorage.getItem(key)
    if (raw == null) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeSessionValue<T>(key: string, value: T) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * Persist list filter state across in-app navigation for the browser tab session.
 * Survives leaving a list page and returning via sidebar, back, or breadcrumbs.
 */
export function useSessionState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    const stored = readSessionValue<unknown>(key, initial)
    if (
      stored != null &&
      typeof stored === 'object' &&
      !Array.isArray(stored) &&
      typeof initial === 'object' &&
      initial != null &&
      !Array.isArray(initial)
    ) {
      return { ...(initial as object), ...(stored as object) } as T
    }
    return stored ?? initial
  })

  const setPersistedState = useCallback(
    (update: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof update === 'function' ? update(prev) : update
        writeSessionValue(key, next)
        return next
      })
    },
    [key],
  )

  return [state, setPersistedState] as const
}
