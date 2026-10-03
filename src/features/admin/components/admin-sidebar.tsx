import { ChevronDown, LogOut, X } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { useLogoutConfirm } from '../../auth/hooks/use-logout-confirm'
import { filterNavigationForUser } from '../../auth/lib/navigation-access'
import { useAuthStore } from '../../auth/store/auth-store'
import {
  badgeCountForNavItem,
  type NavBadges,
} from '../api/nav-badges-api'
import {
  isNavigationGroup,
  type NavigationGroupItem,
  type NavigationLeafItem,
  type NavigationItem,
} from '../config/navigation'
import { useNavBadgesQuery } from '../hooks/use-nav-badges-query'

type AdminSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

function formatBadgeCount(count: number) {
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

function NavCountBadge({
  count,
  active,
}: {
  count: number
  active?: boolean
}) {
  const label = formatBadgeCount(count)
  if (!label) return null

  return (
    <span
      className={cn(
        'ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
        active
          ? 'bg-white/20 text-white'
          : 'bg-[#253CA1] text-white',
      )}
      aria-label={`${count} pending`}
    >
      {label}
    </span>
  )
}

function isLeafActive(item: NavigationLeafItem, pathname: string) {
  return item.to === pathname || pathname.startsWith(`${item.to}/`)
}

function isGroupActive(item: NavigationGroupItem, pathname: string) {
  return item.children.some((child) => isLeafActive(child, pathname))
}

function groupBadgeCount(
  item: NavigationGroupItem,
  badges: NavBadges | undefined,
) {
  return item.children.reduce(
    (sum, child) => sum + badgeCountForNavItem(child.id, badges),
    0,
  )
}

function SidebarLeaf({
  item,
  isActive,
  badgeCount,
  onNavigate,
}: {
  item: NavigationLeafItem
  isActive: boolean
  badgeCount: number
  onNavigate: () => void
}) {
  const Icon = item.icon

  if (item.to) {
    return (
      <Link
        to={item.to}
        onClick={onNavigate}
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5',
          isActive
            ? 'bg-gradient-to-r from-[#3D56C4] via-[#253CA1] to-[#1B2A5A] text-white shadow-lg shadow-[#253CA1]/25'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl border text-xs transition-colors',
            isActive
              ? 'border-white/20 bg-white/15 text-white'
              : 'border-slate-200 bg-white text-[#253CA1]',
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 truncate">{item.label}</span>
        <NavCountBadge count={badgeCount} active={isActive} />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate()
        notify('info', {
          title: `${item.label} is coming soon`,
          description: 'This section is prepared as a placeholder for a later step.',
        })
      }}
      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900"
    >
      <span className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#253CA1]">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 truncate">{item.label}</span>
      <NavCountBadge count={badgeCount} />
    </button>
  )
}

function SidebarGroup({
  item,
  pathname,
  isExpanded,
  badgeCount,
  badges,
  onToggle,
  onNavigate,
}: {
  item: NavigationGroupItem
  pathname: string
  isExpanded: boolean
  badgeCount: number
  badges: NavBadges | undefined
  onToggle: () => void
  onNavigate: () => void
}) {
  const Icon = item.icon
  const isActive = isGroupActive(item, pathname)

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-all duration-200',
          isActive
            ? 'bg-[#E8EEFF] text-[#253CA1]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs transition-colors',
              isActive
                ? 'border-[#C8D4F5] bg-white text-[#253CA1]'
                : 'border-slate-200 bg-white text-[#253CA1]',
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 truncate">{item.label}</span>
          {!isExpanded ? <NavCountBadge count={badgeCount} /> : null}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-5 space-y-1 border-l border-slate-200 pl-4">
            {item.children.map((child) => (
              <SidebarLeaf
                key={child.id}
                item={child}
                isActive={isLeafActive(child, pathname)}
                badgeCount={badgeCountForNavItem(child.id, badges)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { requestLogout, logoutDialog } = useLogoutConfirm()
  const user = useAuthStore((state) => state.user)
  const navBadgesQuery = useNavBadgesQuery()
  const badges = navBadgesQuery.data
  const pathname = useLocation({
    select: (location) => location.pathname,
  })

  const navigation = useMemo(
    () => filterNavigationForUser(user),
    [user],
  )

  const homePath = navigation[0]
    ? isNavigationGroup(navigation[0])
      ? navigation[0].children[0]?.to ?? '/profile'
      : navigation[0].to ?? '/profile'
    : '/profile'

  const routeExpanded = useMemo(() => {
    const expanded = new Set<string>()

    navigation.forEach((item) => {
      if (isNavigationGroup(item) && isGroupActive(item, pathname)) {
        expanded.add(item.id)
      }
    })

    return expanded
  }, [navigation, pathname])

  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set())
  const [manualCollapsed, setManualCollapsed] = useState<Set<string>>(new Set())

  function isExpanded(groupId: string) {
    if (manualCollapsed.has(groupId)) {
      return false
    }

    return routeExpanded.has(groupId) || manualExpanded.has(groupId)
  }

  function toggleGroup(item: NavigationItem) {
    if (!isNavigationGroup(item)) {
      return
    }

    if (isExpanded(item.id)) {
      setManualExpanded((current) => {
        const next = new Set(current)
        next.delete(item.id)
        return next
      })
      setManualCollapsed((current) => new Set(current).add(item.id))
      return
    }

    setManualCollapsed((current) => {
      const next = new Set(current)
      next.delete(item.id)
      return next
    })
    setManualExpanded((current) => new Set(current).add(item.id))
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[18rem] border-r border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-200/70 transition-transform duration-300 ease-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative mb-6 flex justify-center">
          <Link to={homePath} className="inline-flex justify-center" onClick={onClose}>
            <img
              src="/logo.svg"
              alt="Yanks and Brits logo"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mb-4 px-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Menu
          </p>
          <div className="mt-3 h-px w-full bg-slate-200" />
        </div>

        <nav className="scrollbar-thin h-[calc(100vh-12rem)] space-y-2 overflow-y-auto pr-1">
          {navigation.map((item) =>
            isNavigationGroup(item) ? (
              <SidebarGroup
                key={item.id}
                item={item}
                pathname={pathname}
                isExpanded={isExpanded(item.id)}
                badgeCount={groupBadgeCount(item, badges)}
                badges={badges}
                onToggle={() => toggleGroup(item)}
                onNavigate={onClose}
              />
            ) : (
              <SidebarLeaf
                key={item.id}
                item={item}
                isActive={isLeafActive(item, pathname)}
                badgeCount={badgeCountForNavItem(item.id, badges)}
                onNavigate={onClose}
              />
            ),
          )}
        </nav>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose()
              requestLogout()
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-500">
              <LogOut className="size-4" />
            </span>
            Sign Out
          </button>
        </div>
      </aside>
      {logoutDialog}
    </>
  )
}
