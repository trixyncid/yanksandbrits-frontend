import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, DoorOpen, SearchX } from 'lucide-react'
import { useMemo } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  classroomToFormValues,
  deleteClassroom,
} from '../api/classrooms-api'
import { classroomQueryKeys } from '../api/classroom-query-keys'
import { ClassroomForm } from '../components/classroom-form'
import {
  ClassroomListErrorState,
  ClassroomListLoadingState,
} from '../components/classroom-list-states'
import { useClassroomForm } from '../hooks/use-classroom-form'
import { useClassroomQuery } from '../hooks/use-classroom-query'
import type {
  ClassroomFormValues,
  ClassroomListItem,
} from '../types/classroom'

export default function ClassroomEditPage() {
  const navigate = useNavigate()
  const { classroomId } = useParams({ strict: false }) as {
    classroomId: string
  }
  const classroomQuery = useClassroomQuery(classroomId)

  if (classroomQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl">
          <ClassroomListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (classroomQuery.isError) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl space-y-3">
          <ClassroomListErrorState
            onRetry={() => void classroomQuery.refetch()}
          />
          <div className="text-center">
            <Button
              variant="soft"
              size="sm"
              onClick={() => void navigate({ to: '/classrooms' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to classrooms
            </Button>
          </div>
        </div>
      </AdminShell>
    )
  }

  if (!classroomQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={SearchX}
            title="Classroom not found"
            description="This classroom may have been removed or the link is out of date."
            action={
              <Button
                variant="ink"
                onClick={() => void navigate({ to: '/classrooms' })}
              >
                <ArrowLeft className="size-4" />
                Back to classrooms
              </Button>
            }
          />
        </div>
      </AdminShell>
    )
  }

  return (
    <ClassroomEditForm
      classroom={classroomQuery.data}
      initialValues={classroomToFormValues(classroomQuery.data)}
    />
  )
}

function ClassroomEditForm({
  classroom,
  initialValues,
}: {
  classroom: ClassroomListItem
  initialValues: ClassroomFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const branchesQuery = useBranchesQuery()
  const branchOptions = useMemo(
    () =>
      (branchesQuery.data?.data ?? []).map((branch) => ({
        id: branch.id,
        name: branch.name,
      })),
    [branchesQuery.data?.data],
  )
  const form = useClassroomForm({
    mode: 'edit',
    classroomId: classroom.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: `Delete ${classroom.className}?`,
      description: `This permanently removes the classroom ${classroom.className} (${classroom.code}). Past sessions keep their history, but the room can no longer be booked. This can't be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteClassroom(classroom.id)
            await queryClient.invalidateQueries({
              queryKey: classroomQueryKeys.all,
            })
            notify('success', {
              title: 'Classroom deleted',
              description: `${classroom.className} has been removed.`,
            })
            void navigate({ to: '/classrooms' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete classroom',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/classrooms"
          backLabel="Classrooms"
          title={classroom.className}
          description={
            <>
              Editing <span className="font-mono">{classroom.code}</span>
              {classroom.branchName ? ` · ${classroom.branchName}` : null}
            </>
          }
          icon={DoorOpen}
          theme="mist"
          pattern="grid"
          badge={
            <span
              className={
                classroom.isActive
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700'
                  : 'inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500'
              }
            >
              <span
                aria-hidden
                className={
                  classroom.isActive
                    ? 'size-1.5 rounded-full bg-brand-500'
                    : 'size-1.5 rounded-full bg-slate-400'
                }
              />
              {classroom.isActive ? 'Active' : 'Inactive'}
            </span>
          }
        />

        <ClassroomForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          branchOptions={branchOptions}
          branchesLoading={branchesQuery.isLoading}
          meta={{
            createdAt: classroom.createdAt,
            updatedAt: classroom.updatedAt,
            createdBy: classroom.createdBy,
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
