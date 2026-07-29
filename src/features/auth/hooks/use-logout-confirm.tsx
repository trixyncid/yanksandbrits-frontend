import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { LogoutConfirmDialog } from '../components/logout-confirm-dialog'

export function useLogoutConfirm() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function requestLogout() {
    setOpen(true)
  }

  function confirmLogout() {
    setOpen(false)
    notify('success', {
      title: 'Signed out',
      description: 'You have been logged out of the admin panel.',
    })
    void navigate({ to: '/login' })
  }

  const logoutDialog = (
    <LogoutConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={confirmLogout}
    />
  )

  return {
    requestLogout,
    logoutDialog,
  }
}
