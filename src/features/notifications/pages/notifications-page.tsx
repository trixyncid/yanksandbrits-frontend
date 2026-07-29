import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { notificationCategoryMeta } from '../config/category-meta'
import { useNotificationsStore } from '../store/notifications-store'
import type { AppNotification } from '../types/notification'

type FilterTab = 'all' | 'unread'

function NotificationRow({
  item,
  onMarkRead,
  onDelete,
}: {
  item: AppNotification
  onMarkRead: (id: string) => void
  onDelete: (item: AppNotification) => void
}) {
  const meta = notificationCategoryMeta[item.category]
  const Icon = meta.icon

  return (
    <article
      className={cn(
        'group relative flex gap-4 rounded-2xl border px-4 py-4 transition sm:px-5',
        item.read
          ? 'border-transparent bg-transparent hover:border-slate-200 hover:bg-white'
          : 'border-[#D7E4F6] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_70%)] shadow-sm shadow-[#4274B9]/5',
      )}
    >
      {!item.read ? (
        <span className="absolute top-4 right-4 size-2 rounded-full bg-[#4274B9]" />
      ) : null}

      <Link
        to="/notifications/$notificationId"
        params={{ notificationId: item.id }}
        className="absolute inset-0 rounded-2xl"
        aria-label={`Open ${item.title}`}
      />

      <div
        className={cn(
          'relative z-10 mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1',
          meta.tone,
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className={cn(
              'text-sm tracking-tight text-slate-900',
              item.read ? 'font-semibold' : 'font-bold',
            )}
          >
            {item.title}
          </h3>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase ring-1 ring-slate-200">
            {meta.label}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {item.body}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 pointer-events-auto">
          <time className="text-xs font-medium text-slate-400">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </time>
          {!item.read ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onMarkRead(item.id)
              }}
              className="text-xs font-semibold text-[#4274B9] transition hover:text-[#2F5A94]"
            >
              Mark as read
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`Delete ${item.title}`}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDelete(item)
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 transition hover:text-rose-700"
          >
            <Trash2 className="size-3" />
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default function NotificationsPage() {
  const items = useNotificationsStore((state) => state.items)
  const markRead = useNotificationsStore((state) => state.markRead)
  const markAllRead = useNotificationsStore((state) => state.markAllRead)
  const remove = useNotificationsStore((state) => state.remove)
  const [filter, setFilter] = useState<FilterTab>('all')

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  )

  const visibleItems = useMemo(() => {
    if (filter === 'unread') {
      return items.filter((item) => !item.read)
    }
    return items
  }, [filter, items])

  function handleDelete(item: AppNotification) {
    remove(item.id)
    notify('success', {
      title: 'Notification deleted',
      description: `"${item.title}" was removed from your inbox.`,
    })
  }

  function handleMarkAllRead() {
    markAllRead()
    notify('success', {
      title: 'All caught up',
      description: 'Every notification is marked as read.',
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="animate-in fade-in slide-in-from-bottom-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#4274B9]">Inbox</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {unreadCount > 0
                ? `You have ${unreadCount} unread update${unreadCount === 1 ? '' : 's'}.`
                : 'You are all caught up for now.'}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 delay-75 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                filter === tab.id
                  ? 'bg-[#4274B9] text-white shadow-md shadow-[#4274B9]/25'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-2 delay-100 space-y-2 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-2 shadow-sm sm:p-3">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
                <Bell className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No notifications
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {filter === 'unread'
                  ? 'Nothing unread right now. Switch to All to browse earlier updates.'
                  : 'New payments, schedule changes, and student updates will show up here.'}
              </p>
            </div>
          ) : (
            visibleItems.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onMarkRead={markRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>
      </div>
    </AdminShell>
  )
}
