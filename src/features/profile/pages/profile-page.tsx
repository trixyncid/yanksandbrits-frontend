import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  Building2,
  CalendarDays,
  Clock3,
  KeyRound,
  LogOut,
  MapPin,
  Pencil,
  Shield,
} from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { AdminShell } from '../../admin/components/admin-shell'
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
        {value}
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
    <section
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both',
        className,
      )}
    >
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
      <AdminShell>
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
    <AdminShell>
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
      <div
        className="mx-auto max-w-6xl space-y-8"
        style={
          {
            '--profile-blue': '#4274B9',
            '--profile-blue-deep': '#2F5A94',
            '--profile-blue-soft': '#EDF4FF',
          } as CSSProperties
        }
      >
        <header className="animate-in fade-in slide-in-from-bottom-1 duration-500">
          <p className="text-sm font-medium text-[var(--profile-blue)]">
            Account
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            My Profile
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            Your staff identity, contact details, and leave balance for Yanks
            &amp; Brits.
          </p>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#D7E4F6] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_42%,#EDF4FF_100%)] shadow-[0_24px_48px_-28px_rgba(66,116,185,0.35)]">
            <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div className="absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(66,116,185,0.22),transparent_70%)]" />
                  <div className="relative inline-flex size-24 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(160deg,var(--profile-blue)_0%,var(--profile-blue-deep)_100%)] text-3xl font-bold tracking-wide text-white shadow-lg shadow-[#4274B9]/30">
                    {getUserInitials(user.fullName)}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--profile-blue)] uppercase ring-1 ring-[#BED2F2]">
                      {user.pin}
                    </span>
                    <span className="rounded-full bg-[var(--profile-blue-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--profile-blue-deep)]">
                      {user.staffType}
                    </span>
                  </div>
                  <h3 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {user.fullName}
                  </h3>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {user.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="size-3.5 text-[var(--profile-blue)]" />
                      {user.position}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-[var(--profile-blue)]" />
                      {user.branch}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[var(--profile-blue)]" />
                      {user.birthPlace}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setEditProfileOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Edit Profile
                </Button>
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
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-8 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
            <DetailSection
              title="Personal"
              description="Identity details on file for this staff account."
              className="delay-100"
            >
              <DetailItem label="Full name" value={user.fullName} />
              <DetailItem label="Position" value={user.position} />
              <DetailItem
                label="Staff permissions"
                value={user.permissions.join(', ') || '—'}
              />
              <DetailItem
                label="Birth date"
                value={formatDate(user.birthDate)}
              />
              <DetailItem label="Birth place" value={user.birthPlace} />
              <DetailItem label="Gender" value={genderLabel} />
            </DetailSection>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <DetailSection
              title="Contact"
              description="How we reach you across channels."
              className="delay-150"
            >
              <DetailItem
                label="Address"
                value={user.address}
                className="sm:col-span-2"
              />
              <DetailItem label="Mobile phone" value={user.mobilePhone} />
              <DetailItem label="Home phone" value={user.homePhone} />
              <DetailItem label="Other phone" value={user.othersPhone} />
              <DetailItem label="Email" value={user.email} />
            </DetailSection>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <DetailSection
              title="Workplace"
              description="Branch assignment and employment type."
              className="delay-200"
            >
              <DetailItem label="Branch" value={user.branch} />
              <DetailItem label="Staff type" value={user.staffType} />
              <DetailItem label="Staff PIN" value={user.pin} />
            </DetailSection>
          </div>

          <aside className="space-y-4">
            <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-150 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(165deg,var(--profile-blue)_0%,var(--profile-blue-deep)_100%)] p-6 text-white shadow-lg shadow-[#4274B9]/25">
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

            <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-200 space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--profile-blue-soft)] text-[var(--profile-blue)]">
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
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--profile-blue-soft)] text-[var(--profile-blue)]">
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
