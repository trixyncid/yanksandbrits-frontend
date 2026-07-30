import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { logout } from '../api/auth-api'
import { LogoutConfirmDialog } from '../components/logout-confirm-dialog'
import { useAuthStore } from '../store/auth-store'

export function useLogoutConfirm() {
  const navigate = useNavigate()
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
      try {
        await logout()
      } catch {
        // Best-effort blacklist; always clear local session.
      }

      clearSession()
      setOpen(false)
      notify('success', {
        title: 'Signed out',
        description: 'You have been logged out of the admin panel.',
      })
      await navigate({ to: '/login' })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const logoutDialog = (
    <LogoutConfirmDialog
      open={open}
      onOpenChange={setOpen}
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
