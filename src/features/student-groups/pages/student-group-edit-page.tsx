import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Users } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl">
          <StudentGroupListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl space-y-3">
          {groupQuery.isError ? (
            <StudentGroupListErrorState
              onRetry={() => void groupQuery.refetch()}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="Group not found"
              description="This student group may have been removed or the link is out of date."
              action={
                <Button
                  variant="ink"
                  onClick={() => void navigate({ to: '/student-groups' })}
                >
                  <ArrowLeft className="size-4" />
                  Back to student groups
                </Button>
              }
            />
          )}
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
      title: `Delete ${group.groupName}?`,
      description: `This permanently removes the group ${group.groupName}${
        group.members.length > 0
          ? ` and its list of ${group.members.length} ${group.members.length === 1 ? 'student' : 'students'}`
          : ''
      }. The students themselves are not deleted. This cannot be undone.`,
      confirmLabel: 'Delete group',
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

  const isActive = group.status === 'active'

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/student-groups"
          backLabel="Student Groups"
          title={group.groupName}
          description={`Editing members and status · ${group.members.length} ${
            group.members.length === 1 ? 'student' : 'students'
          }`}
          icon={Users}
          theme="sky"
          pattern="rings"
          badge={
            <span
              className={
                isActive
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand-700'
                  : 'inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500'
              }
            >
              <span
                aria-hidden
                className={
                  isActive
                    ? 'size-1.5 rounded-full bg-brand-500'
                    : 'size-1.5 rounded-full bg-slate-400'
                }
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          }
        />

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
    </AdminShell>
  )
}
