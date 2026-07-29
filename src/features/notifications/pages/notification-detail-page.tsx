import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowLeft, BellOff, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
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

    remove(item.id)
    notify('success', {
      title: 'Notification deleted',
      description: `"${item.title}" was removed from your inbox.`,
    })
    void navigate({ to: '/notifications' })
  }

  if (!item) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
            <BellOff className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Notification not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            It may have been deleted, or the link is no longer valid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/notifications' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to notifications
          </Button>
        </div>
      </AdminShell>
    )
  }

  const meta = notificationCategoryMeta[item.category]
  const Icon = meta.icon

  return (
    <AdminShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/notifications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
          >
            <ArrowLeft className="size-4" />
            Notifications
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_60%)] px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-start gap-4">
              <div
                className={cn(
                  'inline-flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1',
                  meta.tone,
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase ring-1 ring-slate-200">
                    {meta.label}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase ring-1 ring-emerald-100">
                    Read
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {item.title}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {format(new Date(item.createdAt), 'EEEE, MMM d, yyyy · h:mm a')}
                  <span className="mx-1.5 text-slate-300">·</span>
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <section>
              <h2 className="text-sm font-semibold text-slate-900">Details</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
            </section>

            <dl className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-slate-400">Reference</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {item.reference ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Branch</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {item.branch ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">From</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">
                  {item.actor ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </AdminShell>
  )
}
