import { useNavigate, useParams } from '@tanstack/react-router'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, BellOff, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

import { EmptyState, PageHeader } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { notificationCategoryMeta } from '../config/category-meta'
import { useNotificationsStore } from '../store/notifications-store'

export default function NotificationDetailPage() {
  const navigate = useNavigate()
  const { notificationId } = useParams({ strict: false }) as {
    notificationId: string
  }
  const item = useNotificationsStore((state) => state.getById(notificationId))
  const markRead = useNotificationsStore((state) => state.markRead)
  const remove = useNotificationsStore((state) => state.remove)

  useEffect(() => {
    if (item && !item.read) {
      markRead(item.id)
    }
  }, [item, markRead])

  function handleDelete() {
    if (!item) {
      return
    }

    const current = item
    requestDeleteConfirm({
      title: 'Delete this notification?',
      description: `"${current.title}" will be removed from your inbox.`,
      onConfirm: () => {
        remove(current.id)
        notify('success', {
          title: 'Notification deleted',
          description: `"${current.title}" was removed from your inbox.`,
        })
        void navigate({ to: '/notifications' })
      },
    })
  }

  if (!item) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <EmptyState
          className="mx-auto max-w-2xl"
          icon={BellOff}
          title="Notification not found"
          description="It may have been deleted, or the link is no longer valid."
          action={
            <Button
              variant="ink"
              onClick={() => void navigate({ to: '/notifications' })}
            >
              <ArrowLeft className="size-4" />
              Back to notifications
            </Button>
          }
        />
      </AdminShell>
    )
  }

  const meta = notificationCategoryMeta[item.category]
  const Icon = meta.icon

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-3xl space-y-3">
        <PageHeader
          backTo="/notifications"
          backLabel="Notifications"
          title={meta.label}
          description={formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
          })}
          icon={Icon}
          theme="mist"
          pattern="dots"
          actions={
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete notification"
              title="Delete notification"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm transition hover:bg-rose-500 hover:text-white"
            >
              <Trash2 className="size-4" />
            </button>
          }
        />

        <article className="animate-in fade-in slide-in-from-bottom-2 space-y-5 rounded-[1.75rem] bg-white px-5 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'inline-flex size-12 shrink-0 items-center justify-center rounded-full',
                meta.tone,
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {item.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {format(new Date(item.createdAt), 'EEEE, MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed text-slate-600">
            {item.body}
          </p>

          <dl className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
              <dt className="text-xs font-medium text-slate-500">Reference</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink">
                {item.reference ?? '—'}
              </dd>
            </div>
            <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
              <dt className="text-xs font-medium text-slate-500">Branch</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink">
                {item.branch ?? '—'}
              </dd>
            </div>
            <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
              <dt className="text-xs font-medium text-slate-500">From</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink">
                {item.actor ?? '—'}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </AdminShell>
  )
}
