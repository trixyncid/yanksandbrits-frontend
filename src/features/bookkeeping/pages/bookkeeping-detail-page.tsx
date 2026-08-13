import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowLeft, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTable, DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteBookkeeping,
  recalculateBookkeeping,
} from '../api/bookkeeping-api'
import { bookkeepingQueryKeys } from '../api/bookkeeping-query-keys'
import { bookkeepingMarketingSalaryColumns } from '../components/bookkeeping-marketing-salary-columns'
import { bookkeepingTutorSalaryColumns } from '../components/bookkeeping-tutor-salary-columns'
import {
  useBookkeepingItemQuery,
  useBookkeepingMarketingSalariesQuery,
  useBookkeepingTutorSalariesQuery,
} from '../hooks/use-bookkeeping-query'
import type {
  BookkeepingMarketingSalaryItem,
  BookkeepingStatus,
  BookkeepingTutorSalaryItem,
} from '../types/bookkeeping'

type DetailTab = 'tutors' | 'marketing'

function formatDate(value: string) {
  if (!value) {
    return '—'
  }
  return format(new Date(value), 'MMM d, yyyy')
}

function formatDateTime(value: string) {
  if (!value) {
    return '—'
  }
  return format(new Date(value), 'MMM d, yyyy · h:mm a')
}

function statusTone(status: BookkeepingStatus) {
  if (status === 'approved') {
    return 'success' as const
  }
  if (status === 'pending') {
    return 'info' as const
  }
  return 'danger' as const
}

function statusLabel(status: BookkeepingStatus) {
  if (status === 'approved') {
    return 'Approved'
  }
  if (status === 'pending') {
    return 'Pending'
  }
  return 'Void'
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold tracking-tight text-slate-900">
        {value || '—'}
      </dd>
    </div>
  )
}

function filterTutor(row: BookkeepingTutorSalaryItem, search: string) {
  const haystack = [row.tutorPin, row.tutorName, row.tutorEmail]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

function filterMarketing(row: BookkeepingMarketingSalaryItem, search: string) {
  const haystack = [row.marketerPin, row.marketerName, row.email]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

export default function BookkeepingDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { bookkeepingId } = useParams({ strict: false }) as {
    bookkeepingId: string
  }
  const itemQuery = useBookkeepingItemQuery(bookkeepingId)
  const tutorsQuery = useBookkeepingTutorSalariesQuery(bookkeepingId)
  const marketingQuery = useBookkeepingMarketingSalariesQuery(bookkeepingId)
  const [tab, setTab] = useState<DetailTab>('tutors')
  const [isRecalculating, setIsRecalculating] = useState(false)

  async function handleRecalculate() {
    setIsRecalculating(true)
    try {
      await recalculateBookkeeping(bookkeepingId)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookkeepingQueryKeys.detail(bookkeepingId),
        }),
        queryClient.invalidateQueries({
          queryKey: bookkeepingQueryKeys.tutorSalaries(bookkeepingId),
        }),
        queryClient.invalidateQueries({
          queryKey: bookkeepingQueryKeys.marketingSalaries(bookkeepingId),
        }),
      ])
      notify('success', {
        title: 'Salaries recalculated',
        description: 'Tutor and marketing salary calculations have been rebuilt for this period.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to recalculate',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete bookkeeping?',
      description:
        'This will permanently remove this bookkeeping period and its salary calculations. This action cannot be undone.',
      onConfirm: () => {
        void (async () => {
          try {
            await deleteBookkeeping(bookkeepingId)
            await queryClient.invalidateQueries({
              queryKey: bookkeepingQueryKeys.all,
            })
            notify('success', {
              title: 'Bookkeeping deleted',
              description: 'The bookkeeping period has been removed.',
            })
            void navigate({ to: '/bookkeeping' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete bookkeeping',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  if (itemQuery.isLoading) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center text-sm text-slate-500">
          Loading bookkeeping period...
        </div>
      </AdminShell>
    )
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-6xl space-y-4 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-800">
            Bookkeeping period not found
          </p>
          <p className="text-sm text-slate-500">
            {itemQuery.isError
              ? getApiErrorMessage(itemQuery.error)
              : 'This period may have been deleted.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/bookkeeping' })}
          >
            Back to bookkeeping
          </Button>
        </div>
      </AdminShell>
    )
  }

  const item = itemQuery.data
  const periodLabel = `${formatDate(item.startDate)} – ${formatDate(item.endDate)}`

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/bookkeeping"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Bookkeeping
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {periodLabel}
              </h1>
              <DataTableBadge tone={statusTone(item.status)}>
                {statusLabel(item.status)}
              </DataTableBadge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {item.title || 'Payroll bookkeeping period'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void navigate({
                  to: '/bookkeeping/$bookkeepingId/edit',
                  params: { bookkeepingId },
                })
              }
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isRecalculating}
              onClick={() => void handleRecalculate()}
            >
              <RefreshCw
                className={cn(
                  'size-4',
                  isRecalculating && 'animate-spin',
                )}
              />
              {isRecalculating ? 'Recalculating…' : 'Recalculate'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDelete}>
              <Trash2 className="size-4 text-rose-500" />
              Delete
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-sm font-semibold text-slate-900">Period details</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Start date" value={formatDate(item.startDate)} />
            <DetailItem label="End date" value={formatDate(item.endDate)} />
            <DetailItem label="Status" value={statusLabel(item.status)} />
            <DetailItem label="Title" value={item.title || '—'} />
            <DetailItem label="Branch" value={item.branchName} />
            <DetailItem label="Created by" value={item.createdBy} />
            <DetailItem
              label="Created at"
              value={formatDateTime(item.createdAt)}
            />
            <DetailItem
              label="Updated at"
              value={formatDateTime(item.updatedAt)}
            />
          </dl>
        </section>

        <section className="space-y-4">
          <div className="flex gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab('tutors')}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
                tab === 'tutors'
                  ? 'bg-gradient-to-r from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] text-white shadow-md shadow-[#4274B9]/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              Tutor salaries
              {tutorsQuery.data ? (
                <span className="ml-1.5 opacity-80">
                  ({tutorsQuery.data.meta.total})
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setTab('marketing')}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
                tab === 'marketing'
                  ? 'bg-gradient-to-r from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] text-white shadow-md shadow-[#4274B9]/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              Marketing salaries
              {marketingQuery.data ? (
                <span className="ml-1.5 opacity-80">
                  ({marketingQuery.data.meta.total})
                </span>
              ) : null}
            </button>
          </div>

          {tab === 'tutors' ? (
            tutorsQuery.isLoading ? (
              <p className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500">
                Loading tutor salaries...
              </p>
            ) : tutorsQuery.isError ? (
              <p className="rounded-2xl border border-rose-100 bg-rose-50/70 px-6 py-12 text-center text-sm text-rose-600">
                {getApiErrorMessage(tutorsQuery.error)}
              </p>
            ) : (
              <DataTable
                title="Tutor salaries"
                description={`Salary calculations for ${periodLabel}.`}
                totalLabel="tutors"
                columns={bookkeepingTutorSalaryColumns}
                data={tutorsQuery.data?.data ?? []}
                searchPlaceholder="Search by tutor, PIN, email..."
                globalFilterFn={filterTutor}
                initialPageSize={10}
                emptyMessage="No tutor salary calculations for this period"
              />
            )
          ) : marketingQuery.isLoading ? (
            <p className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Loading marketing salaries...
            </p>
          ) : marketingQuery.isError ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50/70 px-6 py-12 text-center text-sm text-rose-600">
              {getApiErrorMessage(marketingQuery.error)}
            </p>
          ) : (
            <DataTable
              title="Marketing salaries"
              description={`Salary calculations for ${periodLabel}.`}
              totalLabel="marketers"
              columns={bookkeepingMarketingSalaryColumns}
              data={marketingQuery.data?.data ?? []}
              searchPlaceholder="Search by marketer, PIN, email..."
              globalFilterFn={filterMarketing}
              initialPageSize={10}
              emptyMessage="No marketing salary calculations for this period"
            />
          )}
        </section>
      </div>
    </AdminShell>
  )
}
