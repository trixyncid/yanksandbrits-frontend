import { useState, type ReactNode } from 'react'

import { DeleteConfirmDialog } from '../../../shared/components/delete-confirm-dialog'
import { SupportedBy } from '../../../shared/components/branding/supported-by'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

type AdminShellProps = {
  children: ReactNode
  mainClassName?: string
}

export function AdminShell({ children, mainClassName }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen transition-all duration-300 lg:pl-[5.75rem]">
        <AdminTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main
          className={
            mainClassName ?? 'px-4 py-5 sm:px-6 sm:py-6'
          }
        >
          {children}
        </main>
        <footer className="flex justify-center px-4 pb-5">
          <SupportedBy />
        </footer>
      </div>

      <DeleteConfirmDialog />
    </div>
  )
}
