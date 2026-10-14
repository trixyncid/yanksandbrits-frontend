import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarRange,
  GraduationCap,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTable } from '../../../shared/components/data-table'
import {
  EmptyState,
  ListErrorState,
  ListLoadingState,
  PageHeader,
} from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { DuskPanel } from '../../student-payments/components/payment-ui'
import {
  deleteBookkeeping,
  recalculateBookkeeping,
} from '../api/bookkeeping-api'
import { bookkeepingQueryKeys } from '../api/bookkeeping-query-keys'
import { bookkeepingMarketingSalaryColumns } from '../components/bookkeeping-marketing-salary-columns'
import { BookkeepingSalaryBreakdown } from '../components/bookkeeping-salary-breakdown'
import { bookkeepingTutorSalaryColumns } from '../components/bookkeeping-tutor-salary-columns'
import {
  useBookkeepingItemQuery,
  useBookkeepingMarketingSalariesQuery,
  useBookkeepingStaffSalariesQuery,
  useBookkeepingSalaryBreakdownQuery,
  useBookkeepingTutorSalariesQuery,
} from '../hooks/use-bookkeeping-query'
import {
  bookkeepingStatusLabel,
  formatPeriodDate,
  formatPeriodDateTime,
  periodLengthDays,
} from '../lib/bookkeeping-status'
import type {
  BookkeepingMarketingSalaryItem,
  BookkeepingTutorSalaryItem,
} from '../types/bookkeeping'
import { type BookkeepingStaffSalaryItem } from '../api/staff-salary-api'
import { bookkeepingStaffSalaryColumns } from '../components/bookkeeping-staff-salary-columns'

type DetailTab = 'tutors' | 'marketing' | 'staff' | 'breakdown'

function MoneyTile({
  icon: Icon,
  label,
  amount,
  lines,
  loading,
}: {
  icon: typeof Users
  label: string
  amount: number
  lines: string[]
  loading: boolean
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-[1.75rem] bg-white p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-canvas">
          <Icon className="size-4" />
        </span>
        {label}
      </p>
      <div>
        <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
          {loading ? '–' : formatCurrencyAmount(amount)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {loading ? 'Loading…' : lines.join(' · ')}
        </p>
      </div>
    </div>
  )
}

function filterTutor(row: BookkeepingTutorSalaryItem, search: string) {
  const haystack = [row.tutorPin, row.tutorName, row.tutorEmail]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

function filterStaff(row: BookkeepingStaffSalaryItem, search: string) {
  return [row.staffPin, row.staffName, row.staffEmail, ...row.roles]
    .join(' ')
    .toLowerCase()
    .includes(search)
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
  const staffQuery = useBookkeepingStaffSalariesQuery(bookkeepingId)
  const [tab, setTab] = useState<DetailTab>('tutors')
  const breakdownQuery = useBookkeepingSalaryBreakdownQuery(bookkeepingId)
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
        queryClient.invalidateQueries({
          queryKey: bookkeepingQueryKeys.staffSalaries(bookkeepingId),
        }),
        queryClient.invalidateQueries({
          queryKey: bookkeepingQueryKeys.salaryBreakdown(bookkeepingId),
        }),
      ])
      notify('success', {
        title: 'Salaries recalculated',
        description: 'Tutor and education counsellor salaries have been rebuilt for this period.',
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
      title: 'Delete bookkeeping period?',
      description: `This will permanently remove ${
        itemQuery.data?.title.trim() ||
        (itemQuery.data
          ? `${formatPeriodDate(itemQuery.data.startDate)} – ${formatPeriodDate(itemQuery.data.endDate)}`
          : 'this period')
      } and its salary calculations. This cannot be undone.`,
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-24 animate-pulse rounded-[1.75rem] bg-ink/80" />
          <div className="grid gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-[1.75rem] bg-white"
              />
            ))}
          </div>
          <ListLoadingState rows={5} />
        </div>
      </AdminShell>
    )
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl py-10">
          <EmptyState
            icon={CalendarRange}
            title="Bookkeeping period not found"
            description={
              itemQuery.isError
                ? getApiErrorMessage(itemQuery.error)
                : 'This period may have been deleted.'
            }
            action={
              <Button
                variant="soft"
                onClick={() => void navigate({ to: '/bookkeeping' })}
              >
                <ArrowLeft className="size-4" />
                Back to bookkeeping
              </Button>
            }
          />
        </div>
      </AdminShell>
    )
  }

  const item = itemQuery.data
  const periodLabel = `${formatPeriodDate(item.startDate)} – ${formatPeriodDate(item.endDate)}`
  const days = periodLengthDays(item.startDate, item.endDate)
  const tutorRows = tutorsQuery.data?.data ?? []
  const marketingRows = marketingQuery.data?.data ?? []
  const tutorTotal = tutorRows.reduce((sum, row) => sum + row.totalSalary, 0)
  const marketingTotal = marketingRows.reduce(
    (sum, row) => sum + row.totalSalary,
    0,
  )
  const staffRows = staffQuery.data?.data ?? []
  const staffTotal = staffRows.reduce((sum, row) => sum + row.totalSalary, 0)
  const payroll = tutorTotal + marketingTotal + staffTotal
  const totalsLoading =
    tutorsQuery.isLoading || marketingQuery.isLoading || staffQuery.isLoading
  const tutorShare = payroll > 0 ? (tutorTotal / payroll) * 100 : 0
  const marketingShare = payroll > 0 ? (marketingTotal / payroll) * 100 : 0
  const staffShare = payroll > 0 ? (staffTotal / payroll) * 100 : 0
  const tabs: { id: DetailTab; label: string; count?: number }[] = [
    { id: 'tutors', label: 'Tutor salaries', count: tutorsQuery.data?.meta.total },
    {
      id: 'marketing',
      label: 'Education counsellor salaries',
      count: marketingQuery.data?.meta.total,
    },
    { id: 'staff', label: 'Staff salaries', count: staffQuery.data?.meta.total },
    {
      id: 'breakdown',
      label: 'Counsellor pay breakdown',
      count: breakdownQuery.data?.meta.total,
    },
  ]
  const headerButton =
    'inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/bookkeeping"
          backLabel="Bookkeeping"
          title={periodLabel}
          description={item.title || 'Payroll bookkeeping period'}
          icon={CalendarRange}
          theme="dusk"
          pattern="waves"
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  item.status === 'approved'
                    ? 'bg-emerald-300'
                    : item.status === 'pending'
                      ? 'bg-brand-200'
                      : 'bg-rose-300',
                )}
              />
              {bookkeepingStatusLabel(item.status)}
            </span>
          }
          actions={
            <>
              <button
                type="button"
                className={headerButton}
                onClick={() =>
                  void navigate({
                    to: '/bookkeeping/$bookkeepingId/edit',
                    params: { bookkeepingId },
                  })
                }
              >
                <Pencil className="size-4" />
                Edit
              </button>
              <button
                type="button"
                className={headerButton}
                disabled={isRecalculating}
                title="Rebuild tutor and education counsellor salaries for this period"
                onClick={() => void handleRecalculate()}
              >
                <RefreshCw
                  className={cn('size-4', isRecalculating && 'animate-spin')}
                />
                {isRecalculating ? 'Recalculating…' : 'Recalculate'}
              </button>
              <button
                type="button"
                aria-label="Delete period"
                title="Delete period"
                onClick={handleDelete}
                className="inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-rose-500"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <DuskPanel pattern="waves" className="animate-in fade-in slide-in-from-bottom-2">
            <p className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
              Total payroll
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {totalsLoading ? '–' : formatCurrencyAmount(payroll)}
            </p>
            <div
              className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/15"
              role="img"
              aria-label="Share of payroll for tutors, education counsellors and staff"
            >
              <div
                className="h-full bg-white"
                style={{ width: `${tutorShare}%` }}
              />
              <div
                className="h-full bg-brand-300"
                style={{ width: `${marketingShare}%` }}
              />
              <div
                className="h-full bg-brand-gray"
                style={{ width: `${staffShare}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-white" /> Tutors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-300" /> Education
                counsellors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-gray" /> Staff
              </span>
            </div>
            <p className="mt-4 text-xs text-white/70">
              {days ? `${days} days` : ''}
              {item.branchName && item.branchName !== '—'
                ? ` · ${item.branchName}`
                : ' · All branches'}
            </p>
          </DuskPanel>
          <MoneyTile
            icon={GraduationCap}
            label="Tutors"
            amount={tutorTotal}
            loading={tutorsQuery.isLoading}
            lines={[
              `${tutorRows.length} tutor${tutorRows.length === 1 ? '' : 's'}`,
              `${tutorRows.reduce((sum, row) => sum + row.sessions, 0)} sessions`,
            ]}
          />
          <MoneyTile
            icon={Users}
            label="Education counsellors"
            amount={marketingTotal}
            loading={marketingQuery.isLoading}
            lines={[
              `${marketingRows.length} counsellor${marketingRows.length === 1 ? '' : 's'}`,
              `${marketingRows.reduce((sum, row) => sum + row.totalStudent, 0)} students`,
            ]}
          />
          <MoneyTile
            icon={BriefcaseBusiness}
            label="Staff"
            amount={staffTotal}
            loading={staffQuery.isLoading}
            lines={[
              `${staffRows.length} staff`,
              'Base salaries',
            ]}
          />
        </div>

        <section className="rounded-[1.75rem] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold text-ink">Period details</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Start date', value: formatPeriodDate(item.startDate) },
              { label: 'End date', value: formatPeriodDate(item.endDate) },
              {
                label: 'Created',
                value: `${formatPeriodDateTime(item.createdAt)}${
                  item.createdBy ? ` · ${item.createdBy}` : ''
                }`,
              },
              { label: 'Last updated', value: formatPeriodDateTime(item.updatedAt) },
            ].map((detail) => (
              <div key={detail.label} className="rounded-2xl bg-canvas px-3.5 py-2.5">
                <dt className="text-xs text-slate-500">{detail.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {detail.value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-3">
          <div
            role="tablist"
            aria-label="Period salaries"
            className="flex gap-1 overflow-x-auto rounded-full bg-white p-1"
          >
            {tabs.map((entry) => {
              const active = tab === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(entry.id)}
                  className={cn(
                    'flex-1 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition',
                    active
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-slate-600 hover:bg-canvas hover:text-ink',
                  )}
                >
                  {entry.label}
                  {entry.count != null ? (
                    <span
                      className={cn(
                        'ml-1.5 rounded-full px-1.5 py-0.5 text-[11px]',
                        active ? 'bg-white/20' : 'bg-canvas',
                      )}
                    >
                      {entry.count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {tab === 'tutors' ? (
            tutorsQuery.isLoading ? (
              <ListLoadingState rows={5} />
            ) : tutorsQuery.isError ? (
              <ListErrorState
                title="Unable to load tutor salaries"
                description={getApiErrorMessage(tutorsQuery.error)}
                onRetry={() => void tutorsQuery.refetch()}
              />
            ) : (
              <DataTable
                variant="soft"
                title="Tutor salaries"
                description={`Salary calculations for ${periodLabel}.`}
                totalLabel="tutors"
                columns={bookkeepingTutorSalaryColumns}
                data={tutorsQuery.data?.data ?? []}
                searchPlaceholder="Search by tutor, PIN, email..."
                searchVariant="pill"
                globalFilterFn={filterTutor}
                initialPageSize={10}
                emptyMessage="No tutor salary calculations for this period"
              />
            )
          ) : tab === 'staff' ? (
            staffQuery.isLoading ? (
              <ListLoadingState rows={5} />
            ) : staffQuery.isError ? (
              <ListErrorState
                title="Unable to load staff salaries"
                description={getApiErrorMessage(staffQuery.error)}
                onRetry={() => void staffQuery.refetch()}
              />
            ) : (
              <DataTable
                variant="soft"
                title="Staff salaries"
                description={`Base salaries for ${periodLabel}. System Admin isn't paid through payroll.`}
                totalLabel="staff"
                columns={bookkeepingStaffSalaryColumns}
                data={staffQuery.data?.data ?? []}
                searchPlaceholder="Search by name, PIN, role..."
                searchVariant="pill"
                globalFilterFn={filterStaff}
                initialPageSize={10}
                emptyMessage="No staff salaries for this period"
              />
            )
          ) : tab === 'marketing' ? (
            marketingQuery.isLoading ? (
              <ListLoadingState rows={5} />
            ) : marketingQuery.isError ? (
              <ListErrorState
                title="Unable to load education counsellor salaries"
                description={getApiErrorMessage(marketingQuery.error)}
                onRetry={() => void marketingQuery.refetch()}
              />
            ) : (
              <DataTable
                variant="soft"
                title="Education counsellor salaries"
                description={`Salary calculations for ${periodLabel}.`}
                totalLabel="counsellors"
                columns={bookkeepingMarketingSalaryColumns}
                data={marketingQuery.data?.data ?? []}
                searchPlaceholder="Search by name, PIN, email..."
                searchVariant="pill"
                globalFilterFn={filterMarketing}
                initialPageSize={10}
                emptyMessage="No education counsellor salary calculations for this period"
              />
            )
          ) : (
            <BookkeepingSalaryBreakdown
              bookkeepingId={bookkeepingId}
              periodLabel={periodLabel}
            />
          )}
        </section>
      </div>
    </AdminShell>
  )
}
