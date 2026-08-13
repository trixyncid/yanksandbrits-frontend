import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'
import { cn } from '../../../shared/lib/cn'
import { useLogoutConfirm } from '../../auth/hooks/use-logout-confirm'
import { useAuthStore } from '../../auth/store/auth-store'
import { useNotificationsStore } from '../../notifications/store/notifications-store'
import { getUserInitials } from '../../profile/data/current-user-placeholder'
import { getAuthPosition } from '../../profile/lib/build-current-user-profile'

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

function getFirstName(fullName: string) {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return 'there'
  }
  return trimmed.split(/\s+/)[0] ?? trimmed
}

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { requestLogout, logoutDialog } = useLogoutConfirm()
  const authUser = useAuthStore((state) => state.user)
  const displayName = authUser?.full_name?.trim() || authUser?.email || 'Staff'
  const displayEmail = authUser?.email || '—'
  const displayPosition = authUser ? getAuthPosition(authUser) : 'Staff'
  const firstName = getFirstName(displayName)
  const unreadCount = useNotificationsStore(
    (state) => state.items.filter((item) => !item.read).length,
  )

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#F7F9FC]/85 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={onOpenSidebar}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm shadow-slate-200/40 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94] lg:hidden"
            >
              <Menu className="size-4" />
            </button>

            <div className="min-w-0 animate-in fade-in slide-in-from-left-1 duration-300">
              <p className="text-[11px] font-medium tracking-[0.04em] text-slate-400">
                {getGreeting()}
              </p>
              <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {firstName}
                </h1>
                <span className="inline-flex items-center rounded-full border border-[#BED2F2]/80 bg-[#EDF4FF]/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#2F5A94] uppercase">
                  {displayPosition}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-slate-500 shadow-sm shadow-slate-200/30 md:flex">
              <CalendarDays className="size-3.5 text-[#4274B9]" />
              <time className="text-xs font-medium text-slate-600">
                {formattedDate}
              </time>
            </div>

            <button
              type="button"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications'
              }
              onClick={() => void navigate({ to: '/notifications' })}
              className={cn(
                'relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm shadow-slate-200/30 transition',
                'hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]',
              )}
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#5A8BC9] to-[#2F5A94] px-1 text-[9px] font-bold text-white shadow-sm shadow-[#4274B9]/30">
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
                    'inline-flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white py-1.5 pr-2.5 pl-1.5 shadow-sm shadow-slate-200/30 transition',
                    'hover:border-[#BED2F2] hover:bg-[#F8FBFF]',
                    menuOpen && 'border-[#BED2F2] bg-[#F8FBFF] ring-2 ring-[#4274B9]/10',
                  )}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] text-[11px] font-semibold text-white shadow-sm shadow-[#4274B9]/25">
                    {getUserInitials(displayName)}
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[9rem] truncate text-xs font-semibold text-slate-800">
                      {displayName}
                    </span>
                    <span className="block max-w-[9rem] truncate text-[10px] text-slate-400">
                      {displayEmail}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'hidden size-3.5 text-slate-400 transition duration-200 sm:block',
                      menuOpen && 'rotate-180 text-[#4274B9]',
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-64 overflow-hidden rounded-2xl border-slate-200/80 p-0 shadow-xl shadow-slate-200/50"
              >
                <div className="border-b border-slate-100 bg-gradient-to-b from-[#F8FBFF] to-white px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] text-xs font-semibold text-white shadow-md shadow-[#4274B9]/25">
                      {getUserInitials(displayName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {displayEmail}
                      </p>
                      <p className="mt-1.5 inline-flex rounded-full bg-[#EDF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#2F5A94]">
                        {displayPosition}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      void navigate({ to: '/profile' })
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#EDF4FF] hover:text-[#2F5A94]"
                  >
                    <span className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#4274B9]">
                      <UserRound className="size-3.5" />
                    </span>
                    View profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      requestLogout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <span className="inline-flex size-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500">
                      <LogOut className="size-3.5" />
                    </span>
                    Sign out
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
