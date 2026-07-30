import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
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
      <AdminShell>
        <ClassroomListLoadingState />
      </AdminShell>
    )
  }

  if (classroomQuery.isError || !classroomQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Classroom not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This classroom may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/classrooms' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to classrooms
            </Button>
            {classroomQuery.isError ? (
              <Button
                size="sm"
                onClick={() => void classroomQuery.refetch()}
              >
                Retry
              </Button>
            ) : null}
          </div>
          {classroomQuery.isError ? (
            <div className="mt-8 w-full">
              <ClassroomListErrorState
                onRetry={() => void classroomQuery.refetch()}
              />
            </div>
          ) : null}
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
      title: 'Delete classroom?',
      description: `This will permanently remove ${classroom.className}. This action cannot be undone.`,
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
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/classrooms"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Classrooms
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Classroom
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit details for {classroom.className}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
