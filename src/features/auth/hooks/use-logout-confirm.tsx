import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { logout } from '../api/auth-api'
import { LogoutConfirmDialog } from '../components/logout-confirm-dialog'
import { useAuthStore } from '../store/auth-store'

export function useLogoutConfirm() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  function requestLogout() {
    setOpen(true)
  }

  async function confirmLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      setIsLoggingOut(false)
      notify('error', {
        title: 'Could not sign out, please try again',
      })
      return
    }

    clearSession()
    // Full reload drops every cached query, so the next user sees no old data.
    window.location.assign('/login')
  }

  const logoutDialog = (
    <LogoutConfirmDialog
      open={open}
      onOpenChange={setOpen}
      isLoggingOut={isLoggingOut}
      onConfirm={() => {
        void confirmLogout()
      }}
    />
  )

  return {
    requestLogout,
    logoutDialog,
  }
}
