import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteStaffPermission,
  staffPermissionToFormValues,
} from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'
import { StaffPermissionForm } from '../components/staff-permission-form'
import {
  StaffPermissionListErrorState,
  StaffPermissionListLoadingState,
} from '../components/staff-permission-list-states'
import { useStaffPermissionForm } from '../hooks/use-staff-permission-form'
import { useStaffPermissionQuery } from '../hooks/use-staff-permission-query'
import type {
  StaffPermissionDetail,
  StaffPermissionFormValues,
} from '../types/staff-permission'

export default function StaffPermissionEditPage() {
  const navigate = useNavigate()
  const { groupId } = useParams({ strict: false }) as { groupId: string }
  const groupQuery = useStaffPermissionQuery(groupId)

  if (groupQuery.isLoading) {
    return (
      <AdminShell>
        <StaffPermissionListLoadingState />
      </AdminShell>
    )
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Role not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This role may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/staff-permissions' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to roles
            </Button>
            {groupQuery.isError ? (
              <Button size="sm" onClick={() => void groupQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {groupQuery.isError ? (
            <div className="mt-8 w-full">
              <StaffPermissionListErrorState
                onRetry={() => void groupQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <StaffPermissionEditForm
      group={groupQuery.data}
      initialValues={staffPermissionToFormValues(groupQuery.data)}
    />
  )
}

function StaffPermissionEditForm({
  group,
  initialValues,
}: {
  group: StaffPermissionDetail
  initialValues: StaffPermissionFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useStaffPermissionForm({
    mode: 'edit',
    groupId: group.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete this role?',
      description: `This will permanently remove ${group.name}. Staff who only had this role will lose that access.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStaffPermission(group.id)
            await queryClient.invalidateQueries({
              queryKey: staffPermissionQueryKeys.all,
            })
            notify('success', {
              title: 'Role deleted',
              description: `${group.name} has been removed.`,
            })
            void navigate({ to: '/staff-permissions' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete role',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/staff-permissions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Staff Roles
            </Link>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Edit role
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Choose which pages <span className="font-semibold text-slate-700">{group.name}</span> can open, and whether they can add, edit, or delete records.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <StaffPermissionForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          onChange={form.updateField}
          onTogglePermission={form.togglePermission}
          onSetPermissionGroup={form.setPermissionGroup}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onDelete={handleDelete}
        />
      </div>
    </AdminShell>
  )
}
