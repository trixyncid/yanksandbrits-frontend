import { useNavigate } from '@tanstack/react-router'
import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'
import { cn } from '../../../shared/lib/cn'
import { useLogoutConfirm } from '../../auth/hooks/use-logout-confirm'
import { useNotificationsStore } from '../../notifications/store/notifications-store'
import {
  currentUserPlaceholder,
  getUserInitials,
} from '../../profile/data/current-user-placeholder'

type AdminTopbarProps = {
  onOpenSidebar: () => void
}

function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { requestLogout, logoutDialog } = useLogoutConfirm()
  const user = currentUserPlaceholder
  const unreadCount = useNotificationsStore(
    (state) => state.items.filter((item) => !item.read).length,
  )
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#F7F9FC]/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={onOpenSidebar}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              <Menu className="size-4" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {getGreeting()}, {user.fullName}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span>Nice to see you back</span>
                <span
                  className="hidden text-slate-300 sm:inline"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span className="font-medium text-[#4274B9]">{user.branch}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <p className="hidden pr-2 text-xs font-medium text-slate-500 md:block">
              {formattedDate}
            </p>

            <button
              type="button"
              aria-label="Notifications"
              onClick={() => void navigate({ to: '/notifications' })}
              className={cn(
                'relative inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition',
                'hover:border-slate-200 hover:bg-white hover:text-slate-700',
              )}
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-[#4274B9] text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>

            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pr-2.5 pl-1.5 transition',
                    'hover:border-[#BED2F2] hover:bg-[#F8FBFF]',
                    menuOpen && 'border-[#BED2F2] bg-[#F8FBFF]',
                  )}
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#4274B9] text-[11px] font-semibold text-white">
                    {getUserInitials(user.fullName)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-semibold text-slate-800">
                      {user.fullName}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {user.position}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'hidden size-3.5 text-slate-400 transition sm:block',
                      menuOpen && 'rotate-180',
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 overflow-hidden p-1.5">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      void navigate({ to: '/profile' })
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#EDF4FF] hover:text-[#2F5A94]"
                  >
                    <UserRound className="size-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      requestLogout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      {logoutDialog}
    </>
  )
}
