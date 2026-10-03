import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { KeyRound, LogOut, Pencil, Umbrella } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { AdminShell } from '../../admin/components/admin-shell'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import { useLogoutConfirm } from '../../auth/hooks/use-logout-confirm'
import { useAuthStore } from '../../auth/store/auth-store'
import { fetchUser } from '../../users/api/users-api'
import { ChangePasswordDialog } from '../components/change-password-dialog'
import { EditProfileDialog } from '../components/edit-profile-dialog'
import { getUserInitials } from '../data/current-user-placeholder'
import { buildCurrentUserProfile } from '../lib/build-current-user-profile'

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'do MMMM, yyyy')
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'MMM d, yyyy · h:mm a')
}

function Field({
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
      <dt className="text-[13px] leading-5 text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold tracking-tight break-words text-slate-800">
        {value}
      </dd>
    </div>
  )
}

function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {action}
    </div>
  )
}

function EditIconButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[#253CA1]"
    >
      <Pencil className="size-4" />
    </button>
  )
}

export default function ProfilePage() {
  const { requestLogout, logoutDialog } = useLogoutConfirm()
  const authUser = useAuthStore((state) => state.user)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  const userId = authUser?.id != null ? String(authUser.id) : null

  const userDetailQuery = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  })

  if (!authUser) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-lg py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Profile unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in again to view your staff profile.
          </p>
        </div>
      </AdminShell>
    )
  }

  const user = buildCurrentUserProfile(authUser, userDetailQuery.data)
  const genderLabel =
    user.gender === 'male'
      ? 'Male'
      : user.gender === 'female'
        ? 'Female'
        : '—'

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      {logoutDialog}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        profile={user}
        detail={userDetailQuery.data}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            My Profile
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChangePasswordOpen(true)}
            >
              <KeyRound className="size-3.5" />
              Change Password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={requestLogout}
            >
              <LogOut className="size-3.5" />
              Logout
            </Button>
          </div>
        </div>

        <DashboardPanel
          variant="plump"
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-5 sm:p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:max-w-sm lg:shrink-0">
              <div className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(160deg,#3D56C4_0%,#253CA1_55%,#1B2A5A_100%)] text-lg font-bold tracking-wide text-white shadow-md shadow-[#253CA1]/20 sm:size-20 sm:text-xl">
                {getUserInitials(user.fullName)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {user.fullName}
                </h2>
                <p className="mt-1 truncate text-sm">
                  <span className="font-semibold text-[#253CA1]">
                    {user.position}
                  </span>
                  <span className="text-slate-300"> | </span>
                  <span className="text-slate-500">{user.branch}</span>
                </p>
              </div>
            </div>

            <div className="hidden h-16 w-px shrink-0 bg-slate-200 lg:block" />

            <dl className="grid min-w-0 flex-1 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field label="Staff PIN" value={user.pin} />
              <Field label="Phone number" value={user.mobilePhone} />
              <Field label="Staff type" value={user.staffType} />
              <Field label="Email" value={user.email} />
            </dl>
          </div>
        </DashboardPanel>

        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          <DashboardPanel
            variant="plump"
            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-5 [animation-delay:80ms] sm:p-6 lg:col-span-7"
          >
            <SectionHeader
              title="Personal information"
              action={
                <EditIconButton
                  label="Edit profile"
                  onClick={() => setEditProfileOpen(true)}
                />
              }
            />
            <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field label="Gender" value={genderLabel} />
              <Field
                label="Date of birth"
                value={formatDate(user.birthDate)}
              />
              <Field label="Birth place" value={user.birthPlace} />
              <Field label="Home phone" value={user.homePhone} />
              <Field
                label="Other phone"
                value={user.othersPhone}
                className="sm:col-span-2"
              />
              <Field
                label="Address"
                value={user.address}
                className="sm:col-span-2"
              />
            </dl>
          </DashboardPanel>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <DashboardPanel
              variant="navy"
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:100ms]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-white">Paid leave</p>
                  <p className="mt-0.5 text-sm text-white/60">
                    Annual leave remaining
                  </p>
                </div>
                <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Umbrella className="size-4" />
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight tabular-nums text-white">
                  {user.paidLeaveLeft}
                  <span className="ml-1 text-sm font-semibold text-white/60">
                    days
                  </span>
                </p>
                {userDetailQuery.data ? (
                  <p className="text-xs font-medium tabular-nums text-white/55">
                    of {userDetailQuery.data.paidLeaveTotal} total
                  </p>
                ) : null}
              </div>
              {userDetailQuery.data &&
              userDetailQuery.data.paidLeaveTotal > 0 ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#7B93E8] transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(
                        Math.round(
                          (user.paidLeaveLeft /
                            userDetailQuery.data.paidLeaveTotal) *
                            100,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              ) : null}
            </DashboardPanel>

            <DashboardPanel
              variant="plump"
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-5 [animation-delay:120ms] sm:p-6"
            >
              <SectionHeader title="Workplace" />
              <ul className="mt-5 space-y-4">
                <li className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {user.branch}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">Branch</p>
                  </div>
                </li>
                <li className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {user.position}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">Position</p>
                  </div>
                </li>
                <li className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {user.staffType}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">Staff type</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-700">
                    {user.pin}
                  </p>
                </li>
              </ul>
            </DashboardPanel>

            <DashboardPanel
              variant="plump"
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-5 [animation-delay:160ms] sm:p-6"
            >
              <SectionHeader
                title="Account information"
                action={
                  <EditIconButton
                    label="Change password"
                    onClick={() => setChangePasswordOpen(true)}
                  />
                }
              />
              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <Field label="Email" value={user.email} />
                <Field
                  label="Date joined"
                  value={formatDateTime(user.dateJoined)}
                />
                <Field
                  label="Last login"
                  value={formatDateTime(user.lastLogin)}
                  className="sm:col-span-2"
                />
              </dl>
            </DashboardPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
