import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  Briefcase,
  Building2,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  Umbrella,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { EmptyState, PageBackdrop } from '../../../shared/components/page'
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
  const empty = !value || value === '—'
  return (
    <div className={cn('min-w-0 rounded-2xl bg-canvas px-3.5 py-2.5', className)}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 text-sm font-semibold break-words',
          empty ? 'text-slate-400' : 'text-ink',
        )}
      >
        {empty ? '—' : value}
      </dd>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink">
          <Icon className="size-[1.1rem]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-tight text-ink">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
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
      title={label}
      onClick={onClick}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
    >
      <Pencil className="size-3.5" />
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
        <EmptyState
          className="mx-auto max-w-lg"
          icon={UserRound}
          title="Profile unavailable"
          description="Sign in again to view your staff profile."
        />
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

      <div className="mx-auto max-w-6xl space-y-3">
        <section className="animate-in fade-in slide-in-from-bottom-2 relative isolate overflow-hidden rounded-[1.75rem] px-4 py-6 sm:px-6 sm:py-7">
          <PageBackdrop theme="harbor" pattern="rings" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex size-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold tracking-wide text-brand-700 ring-4 ring-white/25 sm:size-24 sm:text-3xl">
                {getUserInitials(user.fullName)}
              </div>
              <div className="min-w-0">
                <p className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] text-white uppercase">
                  My profile
                </p>
                <h1 className="mt-2 truncate text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  {user.fullName}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 opacity-70" />
                    {user.position}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5 opacity-70" />
                    {user.branch}
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Mail className="size-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{user.email}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditProfileOpen(true)}>
                <Pencil className="size-4" />
                Edit profile
              </Button>
              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                <KeyRound className="size-4" />
                Change password
              </button>
              <button
                type="button"
                onClick={requestLogout}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-rose-500"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-12 lg:items-start">
          <div className="space-y-3 lg:col-span-7">
            <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-4 rounded-[1.75rem] bg-white p-5 [animation-delay:80ms] sm:p-6">
              <SectionHeader
                icon={UserRound}
                title="About me"
                description="Personal details on file with the office."
                action={
                  <EditIconButton
                    label="Edit profile"
                    onClick={() => setEditProfileOpen(true)}
                  />
                }
              />
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Gender" value={genderLabel} />
                <Field
                  label="Date of birth"
                  value={formatDate(user.birthDate)}
                />
                <Field label="Birth place" value={user.birthPlace} />
                <Field label="Mobile phone" value={user.mobilePhone} />
                <Field label="Home phone" value={user.homePhone} />
                <Field label="Other phone" value={user.othersPhone} />
                <Field
                  label="Address"
                  value={user.address}
                  className="sm:col-span-2"
                />
              </dl>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-4 rounded-[1.75rem] bg-white p-5 [animation-delay:140ms] sm:p-6">
              <SectionHeader
                icon={KeyRound}
                title="Sign-in"
                description="Your login and recent activity."
                action={
                  <EditIconButton
                    label="Change password"
                    onClick={() => setChangePasswordOpen(true)}
                  />
                }
              />
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Field label="Email" value={user.email} />
                <Field
                  label="Joined"
                  value={formatDateTime(user.dateJoined)}
                />
                <Field
                  label="Last sign-in"
                  value={formatDateTime(user.lastLogin)}
                />
              </dl>
            </section>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-5">
            <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both relative isolate overflow-hidden rounded-[1.75rem] p-5 text-white [animation-delay:100ms] sm:p-6">
              <PageBackdrop theme="ink" pattern="rings" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold">Paid leave</p>
                    <p className="mt-0.5 text-sm text-white/65">
                      Days off left this year
                    </p>
                  </div>
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-white/15">
                    <Umbrella className="size-4" />
                  </span>
                </div>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <p className="text-5xl font-bold tracking-tight tabular-nums">
                    {user.paidLeaveLeft}
                    <span className="ml-1.5 text-sm font-semibold text-white/60">
                      days
                    </span>
                  </p>
                  {userDetailQuery.data ? (
                    <p className="text-xs font-medium tabular-nums text-white/60">
                      of {userDetailQuery.data.paidLeaveTotal} total
                    </p>
                  ) : null}
                </div>
                {userDetailQuery.data &&
                userDetailQuery.data.paidLeaveTotal > 0 ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-brand-300 transition-all duration-700 ease-out"
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
              </div>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both space-y-4 rounded-[1.75rem] bg-white p-5 [animation-delay:120ms] sm:p-6">
              <SectionHeader
                icon={Briefcase}
                title="Work"
                description="Set by the office. Ask an admin to change these."
              />
              <dl className="grid grid-cols-2 gap-2">
                <Field label="Staff PIN" value={user.pin} />
                {user.subjects !== null ? (
                  <Field label="Subjects" value={user.subjects} />
                ) : null}
                <Field label="Position" value={user.position} />
                <Field label="Branch" value={user.branch} />
              </dl>
            </section>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
