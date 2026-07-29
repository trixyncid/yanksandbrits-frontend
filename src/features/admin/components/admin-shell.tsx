import { useState, type ReactNode } from 'react'

import { DeleteConfirmDialog } from '../../../shared/components/delete-confirm-dialog'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

type AdminShellProps = {
  children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen transition-all duration-300 lg:pl-[18rem]">
        <AdminTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>

      <DeleteConfirmDialog />
    </div>
  )
}
