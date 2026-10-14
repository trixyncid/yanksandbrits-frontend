import { ChevronDown, LogOut, UserRound, X } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'
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
  className,
}: {
  count: number
  className?: string
}) {
  const label = formatBadgeCount(count)
  if (!label) return null

  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-bold text-white tabular-nums',
        className,
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

function comingSoon(item: NavigationLeafItem) {
  notify('info', {
    title: `${item.label} is coming soon`,
    description: 'This section is prepared as a placeholder for a later step.',
  })
}

/* ---------------------------------------------------------------- */
/* Desktop: icon rail                                               */
/* ---------------------------------------------------------------- */

const railButtonClass =
  'relative inline-flex size-11 items-center justify-center rounded-full transition duration-200'

function railStateClass(active: boolean) {
  return active
    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
    : 'bg-canvas text-slate-500 hover:bg-canvas-deep hover:text-ink'
}

/** Label that appears beside a rail icon on hover or keyboard focus. */
function RailTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  )
}

function RailBadgeDot({ count }: { count: number }) {
  const label = formatBadgeCount(count)
  if (!label) return null
  return (
    <span
      className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white ring-2 ring-white"
      aria-label={`${count} pending`}
    >
      {label}
    </span>
  )
}

function RailLeaf({
  item,
  isActive,
  badgeCount,
}: {
  item: NavigationLeafItem
  isActive: boolean
  badgeCount: number
}) {
  const Icon = item.icon
  const className = cn('group', railButtonClass, railStateClass(isActive))

  if (!item.to) {
    return (
      <button
        type="button"
        aria-label={item.label}
        onClick={() => comingSoon(item)}
        className={className}
      >
        <Icon className="size-[1.15rem]" strokeWidth={1.9} />
        <RailTooltip label={item.label} />
      </button>
    )
  }

  return (
    <Link
      to={item.to}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      <Icon className="size-[1.15rem]" strokeWidth={1.9} />
      <RailBadgeDot count={badgeCount} />
      <RailTooltip label={item.label} />
    </Link>
  )
}

function RailGroup({
  item,
  pathname,
  badges,
}: {
  item: NavigationGroupItem
  pathname: string
  badges: NavBadges | undefined
}) {
  const [open, setOpen] = useState(false)
  const Icon = item.icon
  const active = isGroupActive(item, pathname)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={item.label}
          aria-expanded={open}
          className={cn(
            'group',
            railButtonClass,
            railStateClass(active),
            open && !active && 'bg-canvas-deep text-ink',
          )}
        >
          <Icon className="size-[1.15rem]" strokeWidth={1.9} />
          <RailBadgeDot count={groupBadgeCount(item, badges)} />
          {open ? null : <RailTooltip label={item.label} />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={14}
        className="w-60 rounded-3xl border-0 p-2 shadow-[0_24px_48px_-16px_rgba(18,18,18,0.22)]"
      >
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
          {item.label}
        </p>
        <div className="space-y-0.5">
          {item.children.map((child) => {
            const ChildIcon = child.icon
            const childActive = isLeafActive(child, pathname)
            const rowClass = cn(
              'flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition',
              childActive
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 hover:bg-canvas hover:text-ink',
            )
            const content = (
              <>
                <ChildIcon className="size-4 shrink-0" strokeWidth={1.9} />
                <span className="min-w-0 flex-1 truncate">{child.label}</span>
                <NavCountBadge count={badgeCountForNavItem(child.id, badges)} />
              </>
            )
            return child.to ? (
              <Link
                key={child.id}
                to={child.to}
                onClick={() => setOpen(false)}
                aria-current={childActive ? 'page' : undefined}
                className={rowClass}
              >
                {content}
              </Link>
            ) : (
              <button
                key={child.id}
                type="button"
                onClick={() => {
                  setOpen(false)
                  comingSoon(child)
                }}
                className={rowClass}
              >
                {content}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------------------------------------------------------------- */
/* Mobile: labelled drawer                                          */
/* ---------------------------------------------------------------- */

function DrawerLeaf({
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
  const className = cn(
    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition',
    isActive ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-canvas hover:text-ink',
  )
  const content = (
    <>
      <span
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
          isActive ? 'bg-white/70' : 'bg-canvas',
        )}
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <NavCountBadge count={badgeCount} />
    </>
  )

  if (!item.to) {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate()
          comingSoon(item)
        }}
        className={className}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      {content}
    </Link>
  )
}

function DrawerGroup({
  item,
  pathname,
  isExpanded,
  badges,
  onToggle,
  onNavigate,
}: {
  item: NavigationGroupItem
  pathname: string
  isExpanded: boolean
  badges: NavBadges | undefined
  onToggle: () => void
  onNavigate: () => void
}) {
  const Icon = item.icon
  const active = isGroupActive(item, pathname)

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition',
          active ? 'bg-canvas text-ink' : 'text-slate-600 hover:bg-canvas hover:text-ink',
        )}
      >
        <span
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
            active ? 'bg-brand-500 text-white' : 'bg-canvas',
          )}
        >
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {!isExpanded ? (
          <NavCountBadge count={groupBadgeCount(item, badges)} />
        ) : null}
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-slate-400 transition-transform duration-200',
            isExpanded && 'rotate-180',
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
          <div className="ml-6 space-y-0.5 border-l border-slate-200 pl-3">
            {item.children.map((child) => (
              <DrawerLeaf
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

  const profileActive = pathname === '/profile'

  return (
    <>
      {/* Desktop rail */}
      <aside
        aria-label="Main navigation"
        className="fixed inset-y-3 left-3 z-40 hidden w-[4.75rem] flex-col items-center rounded-card bg-white py-5 lg:flex"
      >
        <Link
          to={homePath}
          aria-label="Home"
          className="mb-6 inline-flex size-12 items-center justify-center"
        >
          <img
            src="/logo.svg"
            alt="Yanks and Brits"
            className="max-h-11 w-auto object-contain"
          />
        </Link>

        {/* No scroll container here: it would clip the hover labels.
            The menu sits centred between the logo and the profile/sign-out group. */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-2.5 px-2 py-1">
          {navigation.map((item) =>
            isNavigationGroup(item) ? (
              <RailGroup
                key={item.id}
                item={item}
                pathname={pathname}
                badges={badges}
              />
            ) : (
              <RailLeaf
                key={item.id}
                item={item}
                isActive={isLeafActive(item, pathname)}
                badgeCount={badgeCountForNavItem(item.id, badges)}
              />
            ),
          )}
        </nav>

        <div className="mt-4 flex flex-col items-center gap-2.5">
          <Link
            to="/profile"
            aria-label="My profile"
            className={cn('group', railButtonClass, railStateClass(profileActive))}
          >
            <UserRound className="size-[1.15rem]" strokeWidth={1.9} />
            <RailTooltip label="My profile" />
          </Link>
          <button
            type="button"
            aria-label="Sign out"
            onClick={requestLogout}
            className={cn(
              'group',
              railButtonClass,
              'bg-canvas text-slate-500 hover:bg-rose-50 hover:text-rose-600',
            )}
          >
            <LogOut className="size-[1.15rem]" strokeWidth={1.9} />
            <RailTooltip label="Sign out" />
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-2 left-2 z-40 flex w-[17rem] flex-col rounded-card bg-white px-3 py-4 shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-[110%]',
        )}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <Link to={homePath} onClick={onClose} aria-label="Home">
            <img
              src="/logo.svg"
              alt="Yanks and Brits"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-slate-500 transition hover:bg-canvas-deep hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {navigation.map((item) =>
            isNavigationGroup(item) ? (
              <DrawerGroup
                key={item.id}
                item={item}
                pathname={pathname}
                isExpanded={isExpanded(item.id)}
                badges={badges}
                onToggle={() => toggleGroup(item)}
                onNavigate={onClose}
              />
            ) : (
              <DrawerLeaf
                key={item.id}
                item={item}
                isActive={isLeafActive(item, pathname)}
                badgeCount={badgeCountForNavItem(item.id, badges)}
                onNavigate={onClose}
              />
            ),
          )}
        </nav>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => {
              onClose()
              requestLogout()
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-canvas">
              <LogOut className="size-4" />
            </span>
            Sign out
          </button>
        </div>
      </aside>
      {logoutDialog}
    </>
  )
}
