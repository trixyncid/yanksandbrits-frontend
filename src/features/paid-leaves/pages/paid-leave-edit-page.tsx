import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarCheck, CalendarX, RefreshCw } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
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
import { PaidLeaveListLoadingState } from '../components/paid-leave-list-states'
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-24 animate-pulse rounded-[1.75rem] bg-white/70" />
          <PaidLeaveListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (leaveQuery.isError || !leaveQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <EmptyState
          className="mx-auto max-w-2xl"
          icon={CalendarX}
          title={
            leaveQuery.isError
              ? 'Unable to load this leave record'
              : 'Paid leave not found'
          }
          description={
            leaveQuery.isError
              ? 'Something went wrong while loading this record. You can try again.'
              : 'This leave record may have been removed, or the link is no longer valid.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="soft"
                onClick={() => void navigate({ to: '/paid-leaves' })}
              >
                <ArrowLeft className="size-4" />
                Back to paid leave
              </Button>
              {leaveQuery.isError ? (
                <Button variant="ink" onClick={() => void leaveQuery.refetch()}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              ) : null}
            </div>
          }
        />
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
      title: `Delete ${leave.staffName}'s leave?`,
      description: `This permanently removes the ${leave.totalDays}-day leave record for ${leave.staffName}. This cannot be undone.`,
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

  const statusBadge = {
    approved: 'Approved',
    pending: 'Pending',
    void: 'Void',
  }[leave.status]

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/paid-leaves"
          backLabel="Paid Leave"
          title={`${leave.staffName}'s leave`}
          description={`${leave.totalDays} ${leave.totalDays === 1 ? 'day' : 'days'} · ${leave.branch}`}
          icon={CalendarCheck}
          theme="mist"
          pattern="waves"
          badge={
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
              {statusBadge}
            </span>
          }
        />

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
    </AdminShell>
  )
}
