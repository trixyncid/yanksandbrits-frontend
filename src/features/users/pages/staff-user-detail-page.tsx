import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
} from 'lucide-react'
import { useState, type CSSProperties } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { userQueryKeys } from '../api/user-query-keys'
import { deleteUser } from '../api/users-api'
import { StaffHeader } from '../components/staff-header'
import { StaffLeaveTab } from '../components/staff-leave-tab'
import { StaffSalaryTab } from '../components/staff-salary-tab'
import { StaffScheduleTab } from '../components/staff-schedule-tab'
import {
  formatStaffDate,
  formatStaffDateTime,
  StaffDetailItem,
  StaffDetailSection,
  staffPositionLabel,
  staffRoleBadges,
} from '../components/staff-detail-utils'
import { useUserQuery } from '../hooks/use-user-query'
import type { StaffEntityConfig } from '../lib/staff-entity-config'

type DetailTab = 'schedule' | 'salary' | 'leave'

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'salary', label: 'Salary' },
  { id: 'leave', label: 'Leave' },
]

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
  const [tab, setTab] = useState<DetailTab>('schedule')

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
  const isStudentAccount = user.isStudent

  function handleDelete() {
    requestDeleteConfirm({
      title: `Delete ${entity.singular.toLowerCase()}?`,
      description: `This will permanently remove ${user.fullName}${user.pin ? ` (${user.pin})` : ''}. This action cannot be undone.`,
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
              description: `${user.pin ?? user.fullName} has been removed.`,
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

        <StaffHeader user={user} entity={entity} onDelete={handleDelete} />

        {isStudentAccount && user.studentId ? (
          <div className="rounded-[1.25rem] border border-[#BED2F2] bg-[#F8FBFF] px-5 py-4 text-sm text-slate-600">
            This is a student login account. Manage CRM details and portal
            access from the{' '}
            <Link
              to="/students/$studentId"
              params={{ studentId: user.studentId }}
              className="font-semibold text-[#2F5A94] underline-offset-2 hover:underline"
            >
              student record
            </Link>
            .
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="animate-in fade-in slide-in-from-bottom-2 delay-75 space-y-8 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
            <StaffDetailSection
              title="Personal"
              description={`Identity details for this ${entity.singular.toLowerCase()}.`}
            >
              <StaffDetailItem label="Full name" value={user.fullName} />
              <StaffDetailItem
                label="Position"
                value={staffPositionLabel(user)}
              />
              <StaffDetailItem
                label="Roles"
                value={staffRoleBadges(user).join(', ')}
              />
              {!isStudentAccount ? (
                <>
                  <StaffDetailItem
                    label="Birth date"
                    value={formatStaffDate(user.birthDate)}
                  />
                  <StaffDetailItem
                    label="Birth place"
                    value={user.birthPlace ?? '—'}
                  />
                  <StaffDetailItem label="Gender" value={genderLabel} />
                  <StaffDetailItem label="Initial" value={user.initial ?? '—'} />
                </>
              ) : null}
            </StaffDetailSection>

            {!isStudentAccount ? (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <StaffDetailSection
                  title="Contact"
                  description="How we reach this person across channels."
                >
                  <StaffDetailItem
                    label="Address"
                    value={user.address ?? '—'}
                    className="sm:col-span-2"
                  />
                  <StaffDetailItem label="Mobile phone" value={user.phone || '—'} />
                  <StaffDetailItem
                    label="Home phone"
                    value={user.homePhone ?? '—'}
                  />
                  <StaffDetailItem
                    label="Other phone"
                    value={user.otherPhone ?? '—'}
                  />
                  <StaffDetailItem label="Email" value={user.email || '—'} />
                </StaffDetailSection>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <StaffDetailSection
                  title="Workplace"
                  description="Branch assignment and employment details."
                >
                  <StaffDetailItem
                    label="Branch"
                    value={user.branchName ?? '—'}
                  />
                  <StaffDetailItem
                    label="Staff type"
                    value={user.staffType ?? '—'}
                  />
                  <StaffDetailItem label="Staff PIN" value={user.pin ?? '—'} />
                  <StaffDetailItem
                    label="Resign date"
                    value={formatStaffDate(user.resignDate)}
                  />
                </StaffDetailSection>
              </>
            ) : (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <StaffDetailSection
                  title="Account"
                  description="Login identity for this student portal user."
                >
                  <StaffDetailItem label="Email" value={user.email || '—'} />
                  <StaffDetailItem
                    label="Branch"
                    value={user.branchName ?? '—'}
                  />
                </StaffDetailSection>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="animate-in fade-in slide-in-from-bottom-2 delay-100 space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF4FF] text-[#4274B9]">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">Date joined</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatStaffDateTime(user.dateJoined)}
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
                      {formatStaffDateTime(user.updatedAt)}
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
                      {formatStaffDateTime(user.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {!isStudentAccount ? (
          <section className="animate-in fade-in slide-in-from-bottom-2 delay-150 space-y-4">
            <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:max-w-lg">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    tab === item.id
                      ? 'bg-[#4274B9] text-white shadow-md shadow-[#4274B9]/25'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {tab === 'schedule'
                    ? 'Working schedule'
                    : tab === 'salary'
                      ? 'Salary'
                      : 'Paid leave'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {tab === 'schedule'
                    ? 'Weekly working hours and schedule-linked rates.'
                    : tab === 'salary'
                      ? 'Compensation details for this staff member.'
                      : 'Leave balance and request history.'}
                </p>
              </div>

              {tab === 'schedule' ? <StaffScheduleTab user={user} /> : null}
              {tab === 'salary' ? <StaffSalaryTab user={user} /> : null}
              {tab === 'leave' ? <StaffLeaveTab user={user} /> : null}
            </div>
          </section>
        ) : null}
      </div>
    </AdminShell>
  )
}
