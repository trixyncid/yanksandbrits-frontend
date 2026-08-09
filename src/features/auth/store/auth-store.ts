import { create } from 'zustand'

import { fetchMe, refreshSession } from '../api/auth-api'
import {
  clearAuthStorage,
  clearLegacyTokenKeys,
  loadRememberMe,
  saveRememberMe,
} from '../lib/token-storage'
import type { AuthSession, AuthUser } from '../types/auth'

function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    roles: user.roles ?? [],
    permissions: user.permissions ?? [],
  }
}

type AuthState = {
  user: AuthUser | null
  rememberMe: boolean
  isAuthenticated: boolean
  hydrated: boolean
  hydrate: () => Promise<void>
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

let hydratePromise: Promise<void> | null = null

async function resolveCurrentUser(rememberMe: boolean): Promise<AuthUser> {
  try {
    return await fetchMe()
  } catch {
    await refreshSession(rememberMe)
    return await fetchMe()
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  rememberMe: true,
  isAuthenticated: false,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) {
      return Promise.resolve()
    }

    if (hydratePromise) {
      return hydratePromise
    }

    hydratePromise = (async () => {
      clearLegacyTokenKeys()
      const rememberMe = loadRememberMe()

      try {
        const user = normalizeAuthUser(await resolveCurrentUser(rememberMe))
        set({
          user,
          rememberMe,
          isAuthenticated: true,
          hydrated: true,
        })
      } catch {
        set({
          user: null,
          rememberMe,
          isAuthenticated: false,
          hydrated: true,
        })
      } finally {
        hydratePromise = null
      }
    })()

    return hydratePromise
  },

  setSession: (session) => {
    saveRememberMe(session.rememberMe)
    clearLegacyTokenKeys()
    set({
      user: normalizeAuthUser(session.user),
      rememberMe: session.rememberMe,
      isAuthenticated: true,
      hydrated: true,
    })
  },

  clearSession: () => {
    clearAuthStorage()
    set({
      user: null,
      isAuthenticated: false,
      hydrated: true,
    })
  },
}))
