import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { userToFormValues, type UserFormValues } from '../api/users-api'
import { UserForm } from '../components/user-form'
import { useUserForm } from '../hooks/use-user-form'
import { useUserQuery } from '../hooks/use-user-query'
import type { StaffEntityConfig } from '../lib/staff-entity-config'

function detailLink(entity: StaffEntityConfig, id: string) {
  if (entity.kind === 'staff') {
    return {
      to: '/users/$userId' as const,
      params: { userId: id },
      label: id,
    }
  }
  if (entity.kind === 'tutor') {
    return {
      to: '/tutors/$tutorId' as const,
      params: { tutorId: id },
      label: id,
    }
  }
  return {
    to: '/marketings/$marketingId' as const,
    params: { marketingId: id },
    label: id,
  }
}

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
      <AdminShell>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-sm text-slate-500">
          Loading {entity.singular.toLowerCase()}...
        </div>
      </AdminShell>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {entity.singular} not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This {entity.singular.toLowerCase()} may have been removed or the
            link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: entity.listPath })}
          >
            <ArrowLeft className="size-3.5" />
            Back to {entity.plural.toLowerCase()}
          </Button>
        </div>
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
  const back = detailLink(entity, userId)

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to={back.to}
              params={back.params}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              {pin || 'Account'} | {fullName}
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update {entity.singular}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit profile details for this {entity.singular.toLowerCase()}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
        </div>
      </div>
    </AdminShell>
  )
}
