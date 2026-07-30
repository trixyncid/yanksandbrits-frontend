const REMEMBER_KEY = 'yab.auth.remember'

/** Legacy JWT keys — cleared on logout / hydrate so old tokens are not left behind. */
const LEGACY_KEYS = [
  'yab.auth.access',
  'yab.auth.refresh',
  'yab.auth.user',
] as const

export function loadRememberMe(): boolean {
  const raw =
    window.localStorage.getItem(REMEMBER_KEY) ??
    window.sessionStorage.getItem(REMEMBER_KEY)
  if (raw === null) return true
  return raw !== '0'
}

export function saveRememberMe(rememberMe: boolean): void {
  const target = rememberMe ? window.localStorage : window.sessionStorage
  const other = rememberMe ? window.sessionStorage : window.localStorage
  other.removeItem(REMEMBER_KEY)
  target.setItem(REMEMBER_KEY, rememberMe ? '1' : '0')
}

export function clearAuthStorage(): void {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(REMEMBER_KEY)
    for (const key of LEGACY_KEYS) {
      storage.removeItem(key)
    }
  }
}

export function clearLegacyTokenKeys(): void {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of LEGACY_KEYS) {
      storage.removeItem(key)
    }
  }
}
