import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
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
import { StaffPermissionListLoadingState } from '../components/staff-permission-list-states'
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="h-24 animate-pulse rounded-[1.75rem] bg-white/70" />
          <StaffPermissionListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <EmptyState
          className="mx-auto max-w-2xl"
          icon={ShieldOff}
          title={groupQuery.isError ? 'Unable to load this role' : 'Role not found'}
          description={
            groupQuery.isError
              ? 'Something went wrong while loading this role. You can try again.'
              : 'This role may have been removed, or the link is no longer valid.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="soft"
                onClick={() => void navigate({ to: '/staff-permissions' })}
              >
                <ArrowLeft className="size-4" />
                Back to roles
              </Button>
              {groupQuery.isError ? (
                <Button variant="ink" onClick={() => void groupQuery.refetch()}>
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
      title: `Delete the ${group.name} role?`,
      description: `This removes ${group.name} from ${group.memberCount} ${group.memberCount === 1 ? 'person' : 'people'}. Anyone who only had this role will lose that access. This cannot be undone.`,
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
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/staff-permissions"
          backLabel="Roles"
          title={group.name}
          description={`Choose which pages this role can open, and whether it can add, edit or delete. Given to ${group.memberCount} ${group.memberCount === 1 ? 'person' : 'people'}.`}
          icon={ShieldCheck}
          theme="ink"
          pattern="grid"
          badge={
            group.isSystem ? (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                Built-in
              </span>
            ) : null
          }
        />

        <StaffPermissionForm
          mode="edit"
          roleId={group.id}
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
