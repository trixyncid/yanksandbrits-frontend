import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentGroupQueryKeys } from '../api/student-group-query-keys'
import { StudentGroupForm } from '../components/student-group-form'
import { studentGroupToFormValues } from '../data/student-groups-placeholder'
import { useStudentGroupForm } from '../hooks/use-student-group-form'
import { useStudentGroupsStore } from '../store/student-groups-store'

export default function StudentGroupEditPage() {
  const navigate = useNavigate()
  const { groupId } = useParams({ strict: false }) as { groupId: string }
  const group = useStudentGroupsStore((state) => state.getById(groupId))

  if (!group) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Group not found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This student group may have been removed or the link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/student-groups' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to student groups
          </Button>
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentGroupEditForm
      groupId={group.id}
      groupName={group.groupName}
      initialValues={studentGroupToFormValues(group)}
      meta={{
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        createdBy: group.createdBy,
        branch: group.branch,
      }}
    />
  )
}

function StudentGroupEditForm({
  groupId,
  groupName,
  initialValues,
  meta,
}: {
  groupId: string
  groupName: string
  initialValues: ReturnType<typeof studentGroupToFormValues>
  meta: {
    createdAt: string
    updatedAt: string
    createdBy: string
    branch: string
  }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeGroup = useStudentGroupsStore((state) => state.remove)
  const form = useStudentGroupForm({
    mode: 'edit',
    groupId,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete group?',
      description: `This will permanently remove ${groupName}. This action cannot be undone.`,
      onConfirm: () => {
        removeGroup(groupId)
        void queryClient.invalidateQueries({
          queryKey: studentGroupQueryKeys.all,
        })
        notify('success', {
          title: 'Group deleted',
          description: `${groupName} has been removed.`,
        })
        void navigate({ to: '/student-groups' })
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
              Edit members and status for {groupName}.
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
            meta={meta}
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
