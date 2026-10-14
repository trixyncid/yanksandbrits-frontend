import { Link } from '@tanstack/react-router'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { Bell, BellDot, CheckCheck, Inbox, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState, PageHero } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { notificationCategoryMeta } from '../config/category-meta'
import { useNotificationsStore } from '../store/notifications-store'
import type { AppNotification } from '../types/notification'

type FilterTab = 'all' | 'unread'

function dayLabel(value: string) {
  const date = new Date(value)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return 'Earlier'
}

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
        'group relative flex gap-3.5 rounded-3xl px-4 py-4 transition sm:gap-4 sm:px-5',
        item.read ? 'bg-white hover:bg-canvas/60' : 'bg-brand-50 hover:bg-brand-100/70',
      )}
    >
      <Link
        to="/notifications/$notificationId"
        params={{ notificationId: item.id }}
        className="absolute inset-0 rounded-3xl"
        aria-label={`Open ${item.title}`}
      />

      <div
        className={cn(
          'relative z-10 mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full',
          meta.tone,
        )}
      >
        <Icon className="size-4" />
        {!item.read ? (
          <span
            aria-label="Unread"
            className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-brand-500 ring-2 ring-white"
          />
        ) : null}
      </div>

      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className={cn(
              'text-sm tracking-tight text-ink',
              item.read ? 'font-semibold' : 'font-bold',
            )}
          >
            {item.title}
          </h3>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            {meta.label}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {item.body}
        </p>
        <div className="pointer-events-auto mt-2.5 flex flex-wrap items-center gap-2">
          <time className="mr-1 text-xs font-medium text-slate-400">
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
              className="inline-flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-500 hover:text-white"
            >
              <CheckCheck className="size-3" />
              Mark as read
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`Delete ${item.title}`}
            title="Delete notification"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDelete(item)
            }}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white"
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

  const groupedItems = useMemo(() => {
    const groups: { label: string; items: AppNotification[] }[] = []
    for (const item of visibleItems) {
      const label = dayLabel(item.createdAt)
      const group = groups.find((entry) => entry.label === label)
      if (group) group.items.push(item)
      else groups.push({ label, items: [item] })
    }
    return groups
  }, [visibleItems])

  function handleDelete(item: AppNotification) {
    requestDeleteConfirm({
      title: 'Delete this notification?',
      description: `"${item.title}" will be removed from your inbox.`,
      onConfirm: () => {
        remove(item.id)
        notify('success', {
          title: 'Notification deleted',
          description: `"${item.title}" was removed from your inbox.`,
        })
      },
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
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Inbox"
          title="Notifications"
          description={
            unreadCount > 0
              ? `You have ${unreadCount} unread update${unreadCount === 1 ? '' : 's'} about payments, schedules, students and leave.`
              : 'You are all caught up. New updates about payments, schedules, students and leave land here.'
          }
          theme="mist"
          pattern="dots"
          actions={
            <Button
              variant="ink"
              disabled={unreadCount === 0}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          }
          stats={[
            {
              id: 'all',
              label: 'In your inbox',
              value: items.length,
              icon: Inbox,
              hint: 'Show all notifications',
              active: filter === 'all',
              onSelect: () => setFilter('all'),
            },
            {
              id: 'unread',
              label: 'Unread',
              value: unreadCount,
              icon: BellDot,
              hint: 'Show unread only',
              active: filter === 'unread',
              onSelect: () => setFilter('unread'),
            },
          ]}
        />

        <div className="mx-auto max-w-3xl space-y-3">
          <div
            role="tablist"
            aria-label="Filter notifications"
            className="animate-in fade-in slide-in-from-bottom-2 flex gap-1 rounded-full bg-white p-1 delay-75 sm:max-w-sm"
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread (${unreadCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  'h-10 flex-1 rounded-full px-4 text-sm font-semibold transition',
                  filter === tab.id
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-slate-500 hover:bg-canvas hover:text-ink',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {visibleItems.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={filter === 'unread' ? 'Nothing unread' : 'No notifications'}
              description={
                filter === 'unread'
                  ? 'Switch to All to look back at earlier updates.'
                  : 'New payments, schedule changes and student updates will show up here.'
              }
              action={
                filter === 'unread' && items.length > 0 ? (
                  <Button variant="soft" onClick={() => setFilter('all')}>
                    Show all
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 delay-100">
              {groupedItems.map((group) => (
                <section key={group.label} className="space-y-2">
                  <h2 className="px-2 text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                    {group.label}
                  </h2>
                  {group.items.map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      onMarkRead={markRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
