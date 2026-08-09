import { useNavigate } from '@tanstack/react-router'
import { Building2, Pencil, Shield, Trash2 } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { getUserInitials, type UserDetail } from '../api/users-api'
import type { StaffEntityConfig } from '../lib/staff-entity-config'
import { staffEditPath, staffPositionLabel } from './staff-detail-utils'

type StaffHeaderProps = {
  user: UserDetail
  entity: StaffEntityConfig
  onDelete: () => void
}

export function StaffHeader({ user, entity, onDelete }: StaffHeaderProps) {
  const navigate = useNavigate()

  return (
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
                {user.pin ?? (user.isStudent ? 'Student' : 'User')}
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
              {!user.isStudent && user.staffType ? (
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
                {staffPositionLabel(user)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5 text-[#4274B9]" />
                {user.branchName || '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {!user.isStudent ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => void navigate(staffEditPath(entity, user.id))}
            >
              <Pencil className="size-3.5" />
              Edit Profile
            </Button>
          ) : user.studentId ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                void navigate({
                  to: '/students/$studentId',
                  params: { studentId: user.studentId! },
                })
              }
            >
              <Pencil className="size-3.5" />
              Open Student
            </Button>
          ) : null}
          {!user.isStudent ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
