import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  Pencil,
  Shield,
  Trash2,
  UserRound,
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { userQueryKeys } from '../api/user-query-keys'
import {
  deleteUser,
  deriveStaffPosition,
  getUserInitials,
  type UserDetail,
} from '../api/users-api'
import { useUserQuery } from '../hooks/use-user-query'
import type { StaffEntityConfig } from '../lib/staff-entity-config'

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'MMM d, yyyy')
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'MMM d, yyyy · h:mm a')
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold tracking-tight text-slate-900">
        {value || '—'}
      </dd>
    </div>
  )
}

function DetailSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(className)}>
      <div className="mb-5">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

function positionLabel(user: UserDetail) {
  if (user.position) return user.position
  const derived = deriveStaffPosition(user)
  return derived.charAt(0).toUpperCase() + derived.slice(1)
}

function editPath(entity: StaffEntityConfig, id: string) {
  if (entity.kind === 'staff') {
    return { to: '/staff/$staffId/edit' as const, params: { staffId: id } }
  }
  if (entity.kind === 'tutor') {
    return { to: '/tutors/$tutorId/edit' as const, params: { tutorId: id } }
  }
  return {
    to: '/marketings/$marketingId/edit' as const,
    params: { marketingId: id },
  }
}

function roleBadges(user: UserDetail) {
  const roles: string[] = []
  if (user.isSuperuser) roles.push('Superuser')
  if (user.isManager) roles.push('Manager')
  if (user.isTutor) roles.push('Tutor')
  if (user.isMarketing) roles.push('Marketing')
  if (roles.length === 0) roles.push('Staff')
  return roles
}

export function StaffUserDetailPage({
  userId,
  entity,
}: {
  userId: string
  entity: StaffEntityConfig
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
            <UserRound className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {entity.singular} not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This {entity.singular.toLowerCase()} may have been deleted, or the
            link is no longer valid.
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
  const genderLabel =
    user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : '—'

  function handleDelete() {
    requestDeleteConfirm({
      title: `Delete ${entity.singular.toLowerCase()}?`,
      description: `This will permanently remove ${user.fullName} (${user.pin}). This action cannot be undone.`,
      onConfirm: () => {
        void deleteUser(user.id)
          .then(async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
              queryClient.invalidateQueries({
                queryKey: entity.listQueryKey,
              }),
            ])
            notify('success', {
              title: `${entity.singular} deleted`,
              description: `${user.pin} has been removed.`,
            })
            void navigate({ to: entity.listPath })
          })
          .catch((error) => {
            notify('error', {
              title: `Unable to delete ${entity.singular.toLowerCase()}`,
              description: getApiErrorMessage(error),
            })
          })
      },
    })
  }

  return (
    <AdminShell>
      <div
        className="mx-auto max-w-6xl space-y-6"
        style={
          {
            '--profile-blue': '#4274B9',
            '--profile-blue-deep': '#2F5A94',
            '--profile-blue-soft': '#EDF4FF',
          } as CSSProperties
        }
      >
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={entity.listPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
          >
            <ArrowLeft className="size-4" />
            {entity.plural}
          </Link>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] border border-[#D7E4F6] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_42%,#EDF4FF_100%)] shadow-[0_24px_48px_-28px_rgba(66,116,185,0.35)]">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(66,116,185,0.22),transparent_70%)]" />
                <div className="relative inline-flex size-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(160deg,#4274B9_0%,#2F5A94_100%)] text-2xl font-bold tracking-wide text-white shadow-lg shadow-[#4274B9]/30 sm:size-24">
                  {getUserInitials(user.fullName)}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#4274B9] uppercase ring-1 ring-[#BED2F2]">
                    {user.pin}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                      user.isActive
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                        : 'bg-rose-50 text-rose-700 ring-rose-100',
                    )}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.staffType ? (
                    <span className="rounded-full bg-[#EDF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#2F5A94]">
                      {user.staffType}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {user.fullName}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {user.email || 'No email on file'}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="size-3.5 text-[#4274B9]" />
                    {positionLabel(user)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-[#4274B9]" />
                    {user.branchName || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => void navigate(editPath(entity, user.id))}
              >
                <Pencil className="size-3.5" />
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={handleDelete}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="animate-in fade-in slide-in-from-bottom-2 delay-75 space-y-8 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
            <DetailSection
              title="Personal"
              description={`Identity details for this ${entity.singular.toLowerCase()}.`}
            >
              <DetailItem label="Full name" value={user.fullName} />
              <DetailItem label="Position" value={positionLabel(user)} />
              <DetailItem label="Roles" value={roleBadges(user).join(', ')} />
              <DetailItem
                label="Birth date"
                value={formatDate(user.birthDate)}
              />
              <DetailItem label="Birth place" value={user.birthPlace ?? '—'} />
              <DetailItem label="Gender" value={genderLabel} />
              <DetailItem label="Initial" value={user.initial ?? '—'} />
            </DetailSection>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <DetailSection
              title="Contact"
              description="How we reach this person across channels."
            >
              <DetailItem
                label="Address"
                value={user.address ?? '—'}
                className="sm:col-span-2"
              />
              <DetailItem label="Mobile phone" value={user.phone || '—'} />
              <DetailItem label="Home phone" value={user.homePhone ?? '—'} />
              <DetailItem label="Other phone" value={user.otherPhone ?? '—'} />
              <DetailItem label="Email" value={user.email || '—'} />
            </DetailSection>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <DetailSection
              title="Workplace"
              description="Branch assignment and employment details."
            >
              <DetailItem label="Branch" value={user.branchName ?? '—'} />
              <DetailItem label="Staff type" value={user.staffType ?? '—'} />
              <DetailItem label="Staff PIN" value={user.pin} />
              <DetailItem
                label="Resign date"
                value={formatDate(user.resignDate)}
              />
            </DetailSection>
          </div>

          <aside className="space-y-4">
            <div className="animate-in fade-in slide-in-from-bottom-2 delay-100 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(165deg,#4274B9_0%,#2F5A94_100%)] p-6 text-white shadow-lg shadow-[#4274B9]/25">
              <p className="text-sm font-medium text-white/75">Annual leave</p>
              <p className="mt-4 text-5xl font-bold tracking-tight">
                {user.paidLeaveLeft}
                <span className="ml-1 text-2xl font-semibold text-white/70">
                  left
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Remaining paid leave balance for the current period.
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 delay-150 space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF4FF] text-[#4274B9]">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Date joined</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatDateTime(user.dateJoined)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF4FF] text-[#4274B9]">
                    <Clock3 className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Last updated</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF4FF] text-[#4274B9]">
                    <Clock3 className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Last login</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatDateTime(user.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
