import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteStudentGroup,
  studentGroupToFormValues,
} from '../api/student-groups-api'
import { studentGroupQueryKeys } from '../api/student-group-query-keys'
import { StudentGroupForm } from '../components/student-group-form'
import {
  StudentGroupListErrorState,
  StudentGroupListLoadingState,
} from '../components/student-group-list-states'
import { useStudentGroupForm } from '../hooks/use-student-group-form'
import { useStudentGroupQuery } from '../hooks/use-student-group-query'
import type {
  StudentGroupFormValues,
  StudentGroupListItem,
} from '../types/student-group'

export default function StudentGroupEditPage() {
  const navigate = useNavigate()
  const { groupId } = useParams({ strict: false }) as { groupId: string }
  const groupQuery = useStudentGroupQuery(groupId)

  if (groupQuery.isLoading) {
    return (
      <AdminShell>
        <StudentGroupListLoadingState />
      </AdminShell>
    )
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Group not found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This student group may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/student-groups' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to student groups
            </Button>
            {groupQuery.isError ? (
              <Button size="sm" onClick={() => void groupQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {groupQuery.isError ? (
            <div className="mt-8 w-full">
              <StudentGroupListErrorState
                onRetry={() => void groupQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentGroupEditForm
      group={groupQuery.data}
      initialValues={studentGroupToFormValues(groupQuery.data)}
    />
  )
}

function StudentGroupEditForm({
  group,
  initialValues,
}: {
  group: StudentGroupListItem
  initialValues: StudentGroupFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useStudentGroupForm({
    mode: 'edit',
    groupId: group.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete group?',
      description: `This will permanently remove ${group.groupName}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentGroup(group.id)
            await queryClient.invalidateQueries({
              queryKey: studentGroupQueryKeys.all,
            })
            notify('success', {
              title: 'Group deleted',
              description: `${group.groupName} has been removed.`,
            })
            void navigate({ to: '/student-groups' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete group',
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
              to="/student-groups"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Student Groups
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Student Group
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit members and status for {group.groupName}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <StudentGroupForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            meta={{
              createdAt: group.createdAt,
              updatedAt: group.updatedAt,
              createdBy: group.createdBy,
              branch: group.branch,
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
