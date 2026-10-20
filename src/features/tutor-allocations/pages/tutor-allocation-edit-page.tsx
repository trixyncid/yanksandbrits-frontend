import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, SearchX, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  useCanApproveTutorAllocation,
  useCanAssignAllocatedPrograms,
  useModulePermissions,
} from '../../auth/hooks/use-permissions'
import { studentQueryKeys } from '../../students/api/student-query-keys'
import {
  approveTutorAllocation,
  assignTutorAllocationPrograms,
  deleteTutorAllocation,
  tutorAllocationToFormValues,
} from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'
import { AllocationStagePill } from '../components/allocation-stage-pill'
import { TutorAllocationApprovalPanel } from '../components/tutor-allocation-approval-panel'
import { TutorAllocationHandoffPanel } from '../components/tutor-allocation-handoff-panel'
import { TutorAllocationForm } from '../components/tutor-allocation-form'
import {
  TutorAllocationListErrorState,
  TutorAllocationListLoadingState,
} from '../components/tutor-allocation-list-states'
import { useTutorAllocationForm } from '../hooks/use-tutor-allocation-form'
import { useTutorAllocationQuery } from '../hooks/use-tutor-allocation-query'
import { allocationStage } from '../lib/allocation-status'
import { programLabel } from '../lib/programs'
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl">
          <TutorAllocationListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (allocationQuery.isError) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl space-y-3">
          <TutorAllocationListErrorState
            onRetry={() => void allocationQuery.refetch()}
          />
          <div className="text-center">
            <Button
              variant="soft"
              size="sm"
              onClick={() => void navigate({ to: '/tutor-allocations' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to tutor allocation
            </Button>
          </div>
        </div>
      </AdminShell>
    )
  }

  if (!allocationQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={SearchX}
            title="Class not found"
            description="This class may have been removed or the link is out of date."
            action={
              <Button
                variant="ink"
                onClick={() => void navigate({ to: '/tutor-allocations' })}
              >
                <ArrowLeft className="size-4" />
                Back to tutor allocation
              </Button>
            }
          />
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
  const canAssign = useCanAssignAllocatedPrograms()
  const { canDelete } = useModulePermissions('tutorAllocations')
  const [current, setCurrent] = useState(allocation)
  const [isApproving, setIsApproving] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const form = useTutorAllocationForm({
    mode: 'edit',
    allocationId: allocation.id,
    initialValues,
    onUpdated: (updated) => {
      setCurrent(updated)
      const tutorsReady = updated.tutorsAllocated && !updated.programsAssigned
      if (!tutorsReady) return
      if (canAssign) {
        notify('success', {
          title: 'Ready to start classes',
          description: 'Assign the program to the students so their sessions can begin.',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return { stay: true, notified: true }
      }
      notify('success', {
        title: 'All tutors assigned',
        description:
          "You're all done with this class. The counsellor will take it from here.",
      })
      return { notified: true }
    },
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

  async function handleAssign() {
    setIsAssigning(true)
    try {
      const updated = await assignTutorAllocationPrograms(current.id)
      setCurrent(updated)
      await queryClient.invalidateQueries({
        queryKey: tutorAllocationQueryKeys.all,
      })
      await queryClient.invalidateQueries({
        queryKey: studentQueryKeys.all,
      })
      notify('success', {
        title: 'Program assigned',
        description:
          'Students have the program and sessions. Tutors have received their sessions.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to assign program',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsAssigning(false)
    }
  }

  function handleDelete() {
    const names = current.members.map((member) => member.studentName).join(', ')
    requestDeleteConfirm({
      title: names ? `Delete the class for ${names}?` : 'Delete this class?',
      description: `This permanently removes the ${current.classType === 'private' ? 'private class' : `group class of ${current.groupSize}`}${names ? ` for ${names}` : ''}, with its tutors and weekly schedule. This can't be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteTutorAllocation(current.id)
            await queryClient.invalidateQueries({
              queryKey: tutorAllocationQueryKeys.all,
            })
            notify('success', {
              title: 'Class deleted',
              description: names
                ? `The class for ${names} has been removed.`
                : 'The class has been removed.',
            })
            void navigate({ to: '/tutor-allocations' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete class',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  const studentNames = current.members
    .map((member) => member.studentName)
    .filter(Boolean)
  const headerFacts = [
    current.classType === 'private'
      ? 'Private class'
      : `Group of ${current.groupSize}`,
    current.program ? programLabel(current.program) : '',
    current.branchName,
  ].filter(Boolean)

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/tutor-allocations"
          backLabel="Tutor Allocation"
          title={studentNames.length > 0 ? studentNames.join(', ') : 'Class'}
          description={headerFacts.join(' · ')}
          icon={UsersRound}
          theme="harbor"
          pattern="ribbons"
          badge={<AllocationStagePill stage={allocationStage(current)} />}
        />
        <TutorAllocationApprovalPanel
          allocation={current}
          canApprove={canApprove}
          isApproving={isApproving}
          onApprove={() => void handleApprove()}
        />
        <TutorAllocationHandoffPanel
          allocation={current}
          canAssign={canAssign}
          isAssigning={isAssigning}
          onAssign={() => void handleAssign()}
        />
        <TutorAllocationForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          approved={current.approved}
          savedMembers={current.members}
          allocationId={current.id}
          tutorNames={current}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onDelete={canDelete ? handleDelete : undefined}
        />
      </div>
    </AdminShell>
  )
}
