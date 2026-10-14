import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, UserRound } from 'lucide-react'

import {
  EmptyState,
  ListLoadingState,
  PageHeader,
} from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { userToFormValues, type UserFormValues } from '../api/users-api'
import { UserForm } from '../components/user-form'
import { useUserForm } from '../hooks/use-user-form'
import { useUserQuery } from '../hooks/use-user-query'
import type { StaffEntityConfig } from '../lib/staff-entity-config'
import { STAFF_ENTITY_THEME } from '../lib/staff-entity-theme'

export function StaffUserEditPage({
  userId,
  entity,
}: {
  userId: string
  entity: StaffEntityConfig
}) {
  const navigate = useNavigate()
  const userQuery = useUserQuery(userId)

  if (userQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl space-y-3" aria-busy="true">
          <div className="h-24 animate-pulse rounded-[1.75rem] bg-white/70" />
          <ListLoadingState rows={6} />
        </div>
      </AdminShell>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <EmptyState
          className="mx-auto max-w-2xl"
          icon={UserRound}
          title={`${entity.singular} not found`}
          description={`This ${entity.singular.toLowerCase()} may have been removed, or the link is no longer valid.`}
          action={
            <Button
              variant="ink"
              onClick={() => void navigate({ to: entity.listPath })}
            >
              <ArrowLeft className="size-4" />
              Back to {entity.plural.toLowerCase()}
            </Button>
          }
        />
      </AdminShell>
    )
  }

  const user = userQuery.data

  return (
    <StaffUserEditForm
      userId={user.id}
      entity={entity}
      initialValues={userToFormValues(user)}
      pin={user.pin ?? ''}
      fullName={user.fullName}
    />
  )
}

function StaffUserEditForm({
  userId,
  entity,
  initialValues,
  pin,
  fullName,
}: {
  userId: string
  entity: StaffEntityConfig
  initialValues: UserFormValues
  pin: string
  fullName: string
}) {
  const form = useUserForm({
    mode: 'edit',
    userId,
    entity,
    initialValues,
  })
  const isRoleAccount = entity.kind === 'tutor' || entity.kind === 'marketing'

  const look = STAFF_ENTITY_THEME[entity.kind]

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo={`${entity.listPath}/${userId}`}
          backLabel={fullName}
          title={`Edit ${fullName}`}
          description={
            <>
              {pin ? <span className="font-mono">PIN {pin} · </span> : null}
              Update this {entity.singular.toLowerCase()}'s profile, sign-in and
              access.
            </>
          }
          icon={look.icon}
          theme={look.theme}
          pattern={look.pattern}
        />

        {isRoleAccount ? (
          <UserForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            entityLabel={entity.singular}
            entityKind={entity.kind}
            defaultRoleCode={entity.defaultRoleCode}
            onChange={form.updateField}
            onSubmit={form.submit}
            onCancel={form.cancel}
          />
        ) : (
          <UserForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            entityLabel={entity.singular}
            onChange={form.updateField}
            onSubmit={form.submit}
            onCancel={form.cancel}
          />
        )}
      </div>
    </AdminShell>
  )
}
