import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarRange } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  bookkeepingToFormValues,
  deleteBookkeeping,
} from '../api/bookkeeping-api'
import { bookkeepingQueryKeys } from '../api/bookkeeping-query-keys'
import { BookkeepingForm } from '../components/bookkeeping-form'
import { BookkeepingListLoadingState } from '../components/bookkeeping-list-states'
import { useBookkeepingForm } from '../hooks/use-bookkeeping-form'
import { useBookkeepingItemQuery } from '../hooks/use-bookkeeping-query'
import {
  bookkeepingStatusLabel,
  formatPeriodDate,
} from '../lib/bookkeeping-status'
import type {
  BookkeepingDetail,
  BookkeepingFormValues,
} from '../types/bookkeeping'

export default function BookkeepingEditPage() {
  const navigate = useNavigate()
  const { bookkeepingId } = useParams({ strict: false }) as {
    bookkeepingId: string
  }
  const itemQuery = useBookkeepingItemQuery(bookkeepingId)

  if (itemQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-24 animate-pulse rounded-[1.75rem] bg-ink/80" />
          <BookkeepingListLoadingState />
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
            description="This period may have been removed or the link is invalid."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="soft"
                  onClick={() => void navigate({ to: '/bookkeeping' })}
                >
                  <ArrowLeft className="size-4" />
                  Back to bookkeeping
                </Button>
                {itemQuery.isError ? (
                  <Button variant="ink" onClick={() => void itemQuery.refetch()}>
                    Try again
                  </Button>
                ) : null}
              </div>
            }
          />
        </div>
      </AdminShell>
    )
  }

  return (
    <BookkeepingEditForm
      item={itemQuery.data}
      initialValues={bookkeepingToFormValues(itemQuery.data)}
    />
  )
}

function BookkeepingEditForm({
  item,
  initialValues,
}: {
  item: BookkeepingDetail
  initialValues: BookkeepingFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const branchesQuery = useBranchesQuery()
  const form = useBookkeepingForm({
    mode: 'edit',
    bookkeepingId: item.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete bookkeeping period?',
      description: `This will permanently remove ${
        item.title.trim() ||
        `${formatPeriodDate(item.startDate)} – ${formatPeriodDate(item.endDate)}`
      } and its salary calculations. This cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteBookkeeping(item.id)
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

  const periodName =
    item.title.trim() ||
    `${formatPeriodDate(item.startDate)} – ${formatPeriodDate(item.endDate)}`

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo={`/bookkeeping/${item.id}`}
          backLabel="Period detail"
          title={periodName}
          description="Update dates, status, or branch for this payroll period."
          icon={CalendarRange}
          theme="dusk"
          pattern="waves"
          badge={
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {bookkeepingStatusLabel(item.status)}
            </span>
          }
        />

        <BookkeepingForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          branchOptions={branchesQuery.data?.data ?? []}
          branchesLoading={branchesQuery.isLoading}
          meta={{
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdBy: item.createdBy,
          }}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onDelete={handleDelete}
        />
      </div>
    </AdminShell>
  )
}
