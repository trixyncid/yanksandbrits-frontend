import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deletePaidLeave,
  paidLeaveToFormValues,
} from '../api/paid-leaves-api'
import { paidLeaveQueryKeys } from '../api/paid-leave-query-keys'
import { PaidLeaveForm } from '../components/paid-leave-form'
import {
  PaidLeaveListErrorState,
  PaidLeaveListLoadingState,
} from '../components/paid-leave-list-states'
import { usePaidLeaveForm } from '../hooks/use-paid-leave-form'
import { usePaidLeaveQuery } from '../hooks/use-paid-leave-query'
import type {
  PaidLeaveFormValues,
  PaidLeaveListItem,
} from '../types/paid-leave'

export default function PaidLeaveEditPage() {
  const navigate = useNavigate()
  const { leaveId } = useParams({ strict: false }) as { leaveId: string }
  const leaveQuery = usePaidLeaveQuery(leaveId)

  if (leaveQuery.isLoading) {
    return (
      <AdminShell>
        <PaidLeaveListLoadingState />
      </AdminShell>
    )
  }

  if (leaveQuery.isError || !leaveQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Paid leave not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This leave record may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/paid-leaves' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to paid leave
            </Button>
            {leaveQuery.isError ? (
              <Button size="sm" onClick={() => void leaveQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {leaveQuery.isError ? (
            <div className="mt-8 w-full">
              <PaidLeaveListErrorState
                onRetry={() => void leaveQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <PaidLeaveEditForm
      leave={leaveQuery.data}
      initialValues={paidLeaveToFormValues(leaveQuery.data)}
    />
  )
}

function PaidLeaveEditForm({
  leave,
  initialValues,
}: {
  leave: PaidLeaveListItem
  initialValues: PaidLeaveFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = usePaidLeaveForm({
    mode: 'edit',
    leaveId: leave.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete paid leave?',
      description: `This will permanently remove the leave record for ${leave.staffName}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deletePaidLeave(leave.id)
            await queryClient.invalidateQueries({
              queryKey: paidLeaveQueryKeys.all,
            })
            notify('success', {
              title: 'Paid leave deleted',
              description: `${leave.staffName}'s leave record has been removed.`,
            })
            void navigate({ to: '/paid-leaves' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete paid leave',
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
              to="/paid-leaves"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Paid Leave
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Paid Leave
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit leave details for {leave.staffName}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <PaidLeaveForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            meta={{
              staffName: leave.staffName,
              branch: leave.branch,
              totalDays: leave.totalDays,
              fileUrl: leave.fileUrl,
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
