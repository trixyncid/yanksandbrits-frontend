import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useCanApproveTutorAllocation } from '../../auth/hooks/use-permissions'
import {
  approveTutorAllocation,
  deleteTutorAllocation,
  tutorAllocationToFormValues,
} from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'
import { TutorAllocationApprovalPanel } from '../components/tutor-allocation-approval-panel'
import { TutorAllocationForm } from '../components/tutor-allocation-form'
import {
  TutorAllocationListErrorState,
  TutorAllocationListLoadingState,
} from '../components/tutor-allocation-list-states'
import { useTutorAllocationForm } from '../hooks/use-tutor-allocation-form'
import { useTutorAllocationQuery } from '../hooks/use-tutor-allocation-query'
import type {
  TutorAllocationFormValues,
  TutorAllocationListItem,
} from '../types/tutor-allocation'

export default function TutorAllocationEditPage() {
  const navigate = useNavigate()
  const { allocationId } = useParams({ strict: false }) as {
    allocationId: string
  }
  const allocationQuery = useTutorAllocationQuery(allocationId)

  if (allocationQuery.isLoading) {
    return (
      <AdminShell>
        <TutorAllocationListLoadingState />
      </AdminShell>
    )
  }

  if (allocationQuery.isError || !allocationQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Class not found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This class may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/tutor-allocations' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to tutor allocation
            </Button>
            {allocationQuery.isError ? (
              <Button size="sm" onClick={() => void allocationQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {allocationQuery.isError ? (
            <div className="mt-8 w-full">
              <TutorAllocationListErrorState
                onRetry={() => void allocationQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <TutorAllocationEditForm
      allocation={allocationQuery.data}
      initialValues={tutorAllocationToFormValues(allocationQuery.data)}
    />
  )
}

function TutorAllocationEditForm({
  allocation,
  initialValues,
}: {
  allocation: TutorAllocationListItem
  initialValues: TutorAllocationFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canApprove = useCanApproveTutorAllocation()
  const [current, setCurrent] = useState(allocation)
  const [isApproving, setIsApproving] = useState(false)
  const form = useTutorAllocationForm({
    mode: 'edit',
    allocationId: allocation.id,
    initialValues,
  })

  async function handleApprove() {
    setIsApproving(true)
    try {
      const updated = await approveTutorAllocation(current.id)
      setCurrent(updated)
      await queryClient.invalidateQueries({
        queryKey: tutorAllocationQueryKeys.all,
      })
      notify('success', {
        title: 'Class approved',
        description: 'Academic leaders can now see this class.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to approve class',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsApproving(false)
    }
  }

  function handleDelete() {
    const names = current.members.map((member) => member.studentName).join(', ')
    requestDeleteConfirm({
      title: 'Delete tutor allocation?',
      description: `This will permanently remove this class${names ? ` for ${names}` : ''}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteTutorAllocation(current.id)
            await queryClient.invalidateQueries({
              queryKey: tutorAllocationQueryKeys.all,
            })
            notify('success', {
              title: 'Tutor allocation deleted',
              description: 'The class has been removed.',
            })
            void navigate({ to: '/tutor-allocations' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete tutor allocation',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/tutor-allocations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]"
            >
              <ArrowLeft className="size-4" />
              Tutor Allocation
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Student Record & Tutor Allocation
              </h2>
              <DataTableBadge tone={current.approved ? 'success' : 'warning'}>
                {current.approved ? 'Approved' : 'Awaiting approval'}
              </DataTableBadge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Scores stay on each student’s prediction test. Tutors and the
              schedule belong to this class.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>
        <TutorAllocationApprovalPanel
          allocation={current}
          canApprove={canApprove}
          isApproving={isApproving}
          onApprove={() => void handleApprove()}
        />
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <TutorAllocationForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            approved={current.approved}
            savedMembers={current.members}
            tutorNames={current}
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
