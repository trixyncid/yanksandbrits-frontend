import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Clock3,
  ExternalLink,
  GraduationCap,
  LogIn,
  Phone,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  EmptyState,
  ListLoadingState,
} from '../../../shared/components/page'
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
import { useAuthUser } from '../../auth/hooks/use-permissions'
import { hasAuthPermission } from '../../auth/types/auth'

type DetailTab = 'schedule' | 'salary' | 'leave'

/** Any of these lets a role read salary setups. */
const PAY_PERMISSIONS = [
  'compensation.view_tutorworkingschedule',
  'compensation.view_marketingsalary',
  'compensation.view_staffsalary',
]

const BASE_TABS: { id: DetailTab; label: string }[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'salary', label: 'Salary' },
  { id: 'leave', label: 'Leave' },
]

const TAB_COPY: Record<
  DetailTab,
  { title: string; description: string }
> = {
  schedule: {
    title: 'Working schedule',
    description: 'The days and hours this person works each week.',
  },
  salary: {
    title: 'Salary',
    description: 'What this person is paid, and how it is worked out.',
  },
  leave: {
    title: 'Paid leave',
    description: 'How much paid leave is left, and past requests.',
  },
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
  const [tab, setTab] = useState<DetailTab>('schedule')
  const authUser = useAuthUser()

  if (userQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl space-y-3" aria-busy="true">
          <div className="h-48 animate-pulse rounded-[1.75rem] bg-white/70" />
          <ListLoadingState rows={5} />
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
          description={`This ${entity.singular.toLowerCase()} may have been deleted, or the link is no longer valid.`}
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
  const genderLabel =
    user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : '—'
  const isStudentAccount = user.isStudent
  const isMarketingDetail =
    entity.kind === 'marketing' || user.isMarketing
  const canReadPay = PAY_PERMISSIONS.some((permission) =>
    hasAuthPermission(authUser, permission),
  )
  // Freelancers have no paid leave, so they get no Leave tab.
  const isFreelance = user.employmentType === 'FL'
  const tabs = (
    isMarketingDetail
      ? [
          { id: 'salary' as const, label: 'Salary' },
          { id: 'leave' as const, label: 'Leave' },
        ]
      : BASE_TABS
  )
    .filter((item) => !(isFreelance && item.id === 'leave'))
    // Pay data is restricted: only roles that can read salaries see the tab.
    .filter((item) => item.id !== 'salary' || canReadPay)
  const activeTab = tabs.some((item) => item.id === tab) ? tab : tabs[0]!.id
  const tabCopy = TAB_COPY[activeTab]

  function handleDelete() {
    requestDeleteConfirm({
      title: `Delete ${user.fullName}?`,
      description: `This permanently removes ${entity.singular.toLowerCase()} ${user.fullName}${user.pin ? ` (${user.pin})` : ''} and their sign-in. This cannot be undone.`,
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

  const employmentLabel =
    user.employmentType === 'FT'
      ? 'Full-time'
      : user.employmentType === 'PT'
        ? 'Part-time'
        : user.employmentType === 'FL'
          ? 'Freelance'
          : '—'

  const activity = [
    { label: 'Joined', value: formatStaffDateTime(user.dateJoined), icon: CalendarDays },
    { label: 'Last updated', value: formatStaffDateTime(user.updatedAt), icon: Clock3 },
    {
      label: 'Last sign-in',
      value: user.lastLogin ? formatStaffDateTime(user.lastLogin) : 'Never signed in',
      icon: LogIn,
    },
  ]

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <StaffHeader user={user} entity={entity} onDelete={handleDelete} />

        {isStudentAccount && user.studentId ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-white px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <GraduationCap className="size-[1.1rem]" />
              </span>
              <p className="text-sm text-slate-600">
                This is a student sign-in. Classes, payments and contact
                details are managed on the student record.
              </p>
            </div>
            <Link
              to="/students/$studentId"
              params={{ studentId: user.studentId }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-4 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
            >
              <ExternalLink className="size-3.5" />
              Student record
            </Link>
          </div>
        ) : null}

        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="animate-in fade-in slide-in-from-bottom-2 delay-75 space-y-6 rounded-[1.75rem] bg-white p-5 sm:p-6">
            <StaffDetailSection
              icon={UserRound}
              title="Personal"
              description={`Who this ${entity.singular.toLowerCase()} is.`}
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
                  <StaffDetailItem label="Initials" value={user.initial ?? '—'} />
                </>
              ) : null}
            </StaffDetailSection>

            {!isStudentAccount ? (
              <>
                <StaffDetailSection
                  icon={Phone}
                  title="Contact"
                  description="How to reach this person."
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

                <StaffDetailSection
                  icon={Briefcase}
                  title="Work"
                  description="Branch, contract and employment dates."
                >
                  <StaffDetailItem
                    label="Branch"
                    value={user.branchName ?? '—'}
                  />
                  {entity.kind === 'marketing' ? null : (
                    <StaffDetailItem
                      label={entity.kind === 'tutor' ? 'Subjects' : 'Staff type'}
                      value={
                        user.staffTypes.length > 0
                          ? user.staffTypes.join(', ')
                          : '—'
                      }
                    />
                  )}
                  {user.isTutor ? (
                    <>
                      <StaffDetailItem
                        label="Employment type"
                        value={employmentLabel}
                      />
                      {user.employmentType === 'FT' ||
                      user.employmentType === 'PT' ? (
                        <StaffDetailItem
                          label="Working days per week"
                          value={
                            user.workingDaysPerWeek == null
                              ? '—'
                              : `${user.workingDaysPerWeek} days`
                          }
                        />
                      ) : null}
                    </>
                  ) : null}
                  <StaffDetailItem label="Staff PIN" value={user.pin ?? '—'} />
                  <StaffDetailItem
                    label="Resign date"
                    value={formatStaffDate(user.resignDate)}
                  />
                </StaffDetailSection>
              </>
            ) : (
              <StaffDetailSection
                icon={LogIn}
                title="Account"
                description="Sign-in details for this student portal user."
              >
                <StaffDetailItem label="Email" value={user.email || '—'} />
                <StaffDetailItem
                  label="Branch"
                  value={user.branchName ?? '—'}
                />
              </StaffDetailSection>
            )}
          </div>

          <aside className="animate-in fade-in slide-in-from-bottom-2 delay-100 rounded-[1.75rem] bg-white p-5 lg:sticky lg:top-4">
            <h3 className="text-base font-bold tracking-tight text-ink">
              Activity
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              When this account was set up and last used.
            </p>
            <ol className="relative mt-4 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[1.1rem] before:w-px before:bg-canvas-deep">
              {activity.map((item) => (
                <li key={item.label} className="relative flex gap-3">
                  <span className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink ring-4 ring-white">
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-semibold text-ink">
                      {item.value}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        {!isStudentAccount ? (
          <section className="animate-in fade-in slide-in-from-bottom-2 delay-150 space-y-3">
            <div
              role="tablist"
              aria-label={`${entity.singular} sections`}
              className={cn(
                'flex gap-1 rounded-full bg-white p-1',
                tabs.length > 3 ? 'sm:max-w-2xl' : 'sm:max-w-md',
              )}
            >
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'h-10 flex-1 rounded-full px-3 text-sm font-semibold transition sm:px-4',
                    activeTab === item.id
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-slate-500 hover:bg-canvas hover:text-ink',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[1.75rem] bg-white">
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <h3 className="text-lg font-bold tracking-tight text-ink">
                  {tabCopy.title}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {tabCopy.description}
                </p>
              </div>

              {activeTab === 'schedule' ? <StaffScheduleTab user={user} /> : null}
              {activeTab === 'salary' ? <StaffSalaryTab user={user} /> : null}
              {activeTab === 'leave' ? <StaffLeaveTab user={user} /> : null}
            </div>
          </section>
        ) : null}
      </div>
    </AdminShell>
  )
}
