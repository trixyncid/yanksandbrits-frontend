import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  CalendarDays,
  LogOut,
  Menu,
  Search,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'
import { cn } from '../../../shared/lib/cn'
import { useLogoutConfirm } from '../../auth/hooks/use-logout-confirm'
import { filterNavigationForUser } from '../../auth/lib/navigation-access'
import { useAuthStore } from '../../auth/store/auth-store'
import { useNotificationsStore } from '../../notifications/store/notifications-store'
import { getUserInitials } from '../../profile/data/current-user-placeholder'
import { getAuthPosition } from '../../profile/lib/build-current-user-profile'
import { isMacPlatform, searchablePages } from '../lib/page-search'
import { AdminCommandSearch } from './admin-command-search'

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

const roundIconButton =
  'relative inline-flex size-11 items-center justify-center rounded-full bg-white text-ink transition hover:bg-brand-50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:outline-none'

export function AdminTopbar({ onOpenSidebar }: AdminTopbarProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { requestLogout, logoutDialog } = useLogoutConfirm()
  const authUser = useAuthStore((state) => state.user)
  const displayName = authUser?.full_name?.trim() || authUser?.email || 'Staff'
  const displayEmail = authUser?.email || '—'
  const displayPosition = authUser ? getAuthPosition(authUser) : 'Staff'
  const firstName = getFirstName(displayName)
  const unreadCount = useNotificationsStore(
    (state) => state.items.filter((item) => !item.read).length,
  )
  const navigation = useMemo(() => filterNavigationForUser(authUser), [authUser])
  const canOpenSchedule = useMemo(
    () => searchablePages(navigation).some(({ item }) => item.to === '/full-schedule'),
    [navigation],
  )
  const shortcutLabel = isMacPlatform() ? '⌘ K' : 'Ctrl K'

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3 py-3 sm:px-5">
          <button
            type="button"
            aria-label="Open menu"
            onClick={onOpenSidebar}
            className={cn(roundIconButton, 'lg:hidden')}
          >
            <Menu className="size-4" />
          </button>

          <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-1 duration-300 md:flex-none md:basis-56 xl:basis-72">
            <p className="text-xs font-medium text-slate-500">
              {getGreeting()},
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight text-ink">
              {firstName}
            </h1>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-12 w-full max-w-xl items-center gap-3 rounded-full bg-white px-5 text-left text-sm text-slate-400 transition hover:ring-2 hover:ring-ink/5"
            >
              <Search className="size-4 shrink-0 text-ink" />
              <span className="flex-1 truncate">Search pages</span>
              <kbd className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {shortcutLabel}
              </kbd>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Search pages"
              onClick={() => setSearchOpen(true)}
              className={cn(roundIconButton, 'md:hidden')}
            >
              <Search className="size-4" />
            </button>

            {canOpenSchedule ? (
              <button
                type="button"
                aria-label="Open full schedule"
                title="Full schedule"
                onClick={() => void navigate({ to: '/full-schedule' })}
                className={cn(roundIconButton, 'hidden sm:inline-flex')}
              >
                <CalendarDays className="size-[1.1rem]" strokeWidth={1.9} />
              </button>
            ) : null}

            <button
              type="button"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications'
              }
              title="Notifications"
              onClick={() => void navigate({ to: '/notifications' })}
              className={roundIconButton}
            >
              <Bell className="size-[1.1rem]" strokeWidth={1.9} />
              {unreadCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white ring-2 ring-white">
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
                    'inline-flex size-11 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white ring-2 ring-white transition hover:ring-brand-200',
                    menuOpen && 'ring-brand-300',
                  )}
                >
                  {getUserInitials(displayName)}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={10}
                className="w-64 overflow-hidden rounded-3xl border-0 p-0 shadow-[0_24px_48px_-16px_rgba(18,18,18,0.22)]"
              >
                <div className="bg-brand-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                      {getUserInitials(displayName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">
                        {displayName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {displayEmail}
                      </p>
                      <p className="mt-1.5 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ink">
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
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-canvas hover:text-ink"
                  >
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-canvas text-ink">
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
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-rose-50 text-rose-500">
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
      <AdminCommandSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        navigation={navigation}
      />
      {logoutDialog}
    </>
  )
}
