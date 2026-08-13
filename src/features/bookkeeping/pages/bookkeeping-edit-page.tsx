import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
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
import {
  BookkeepingListErrorState,
  BookkeepingListLoadingState,
} from '../components/bookkeeping-list-states'
import { useBookkeepingForm } from '../hooks/use-bookkeeping-form'
import { useBookkeepingItemQuery } from '../hooks/use-bookkeeping-query'
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
      <AdminShell>
        <BookkeepingListLoadingState />
      </AdminShell>
    )
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Bookkeeping period not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This period may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/bookkeeping' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to bookkeeping
            </Button>
            {itemQuery.isError ? (
              <Button size="sm" onClick={() => void itemQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {itemQuery.isError ? (
            <div className="mt-8 w-full">
              <BookkeepingListErrorState
                onRetry={() => void itemQuery.refetch()}
              />
            </div>
          ) : null}
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
      title: 'Delete bookkeeping?',
      description:
        'This will permanently remove this bookkeeping period and its salary calculations. This action cannot be undone.',
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

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/bookkeeping/$bookkeepingId"
              params={{ bookkeepingId: item.id }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Period detail
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Edit Bookkeeping Period
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update dates, status, or scope for this payroll period.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
