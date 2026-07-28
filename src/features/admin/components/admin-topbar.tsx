import { Bell, ChevronDown, Menu } from 'lucide-react'

import { notify } from '../../../shared/lib/notify'
import { cn } from '../../../shared/lib/cn'

type AdminTopbarProps = {
  onOpenSidebar: () => void
  userName?: string
  branchName?: string
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

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AdminTopbar({
  onOpenSidebar,
  userName = 'Admin',
  branchName = 'Main Branch',
}: AdminTopbarProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
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
              {getGreeting()}, {userName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
              <span>Nice to see you back</span>
              <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="font-medium text-[#4274B9]">{branchName}</span>
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
            onClick={() =>
              notify('info', {
                title: 'Notifications placeholder',
                description: 'This panel will be connected in a future step.',
              })
            }
            className={cn(
              'relative inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition',
              'hover:border-slate-200 hover:bg-white hover:text-slate-700',
            )}
          >
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#4274B9]" />
          </button>

          <button
            type="button"
            onClick={() =>
              notify('info', {
                title: 'Profile placeholder',
                description: 'Profile actions will be added later.',
              })
            }
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pr-2.5 pl-1.5 transition',
              'hover:border-[#BED2F2] hover:bg-[#F8FBFF]',
            )}
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#4274B9] text-[11px] font-semibold text-white">
              {getInitials(userName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold text-slate-800">
                {userName}
              </span>
              <span className="block text-[10px] text-slate-400">Admin</span>
            </span>
            <ChevronDown className="hidden size-3.5 text-slate-400 sm:block" />
          </button>
        </div>
      </div>
    </header>
  )
}
