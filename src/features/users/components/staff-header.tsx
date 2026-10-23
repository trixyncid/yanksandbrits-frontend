import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Mail,
  Pencil,
  Shield,
  Trash2,
} from 'lucide-react'

import { PageBackdrop, isDarkTheme } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { getUserInitials, type UserDetail } from '../api/users-api'
import type { StaffEntityConfig } from '../lib/staff-entity-config'
import { STAFF_ENTITY_THEME } from '../lib/staff-entity-theme'
import { staffEditPath, staffPositionLabel } from './staff-detail-utils'

type StaffHeaderProps = {
  user: UserDetail
  entity: StaffEntityConfig
  onDelete: () => void
}

/** Avatar-led profile banner at the top of a staff, tutor or counsellor page. */
export function StaffHeader({ user, entity, onDelete }: StaffHeaderProps) {
  const navigate = useNavigate()
  const look = STAFF_ENTITY_THEME[entity.kind]
  const dark = isDarkTheme(look.theme)

  const chip = dark
    ? 'bg-white/15 text-white'
    : 'bg-white/80 text-ink shadow-sm'

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 relative isolate overflow-hidden rounded-[1.75rem] px-4 py-5 sm:px-6 sm:py-6">
      <PageBackdrop theme={look.theme} pattern={look.pattern} />
      <div className="relative">
        <Link
          to={entity.listPath}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-full pr-3.5 pl-2.5 text-xs font-semibold transition hover:-translate-x-0.5',
            dark
              ? 'bg-white/15 text-white hover:bg-white/25'
              : 'bg-white text-ink shadow-sm hover:bg-brand-50',
          )}
        >
          <ArrowLeft className="size-3.5" />
          {entity.plural}
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div
                className={cn(
                  'inline-flex size-20 items-center justify-center rounded-full text-2xl font-bold tracking-wide ring-4 sm:size-24 sm:text-3xl',
                  dark
                    ? 'bg-white text-brand-700 ring-white/20'
                    : 'bg-brand-500 text-white ring-white',
                )}
              >
                {getUserInitials(user.fullName)}
              </div>
              <span
                aria-label={user.isActive ? 'Active' : 'Inactive'}
                title={user.isActive ? 'Active' : 'Inactive'}
                className={cn(
                  'absolute right-1 bottom-1 size-4 rounded-full ring-4',
                  dark ? 'ring-ink' : 'ring-white',
                  user.isActive ? 'bg-emerald-500' : 'bg-slate-400',
                )}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold',
                    chip,
                  )}
                >
                  {user.pin ?? (user.isStudent ? 'Student' : 'User')}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    chip,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-1.5 rounded-full',
                      user.isActive ? 'bg-emerald-500' : 'bg-slate-400',
                    )}
                  />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {entity.kind === 'tutor' && !user.isStudent
                  ? user.staffTypes.map((subject) => (
                      <span
                        key={subject}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          dark
                            ? 'bg-brand-500/60 text-white'
                            : 'bg-brand-100 text-brand-800',
                        )}
                      >
                        {subject}
                      </span>
                    ))
                  : null}
              </div>
              <h1
                className={cn(
                  'mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl',
                  dark ? 'text-white' : 'text-ink',
                )}
              >
                {user.fullName}
              </h1>
              <div
                className={cn(
                  'mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm',
                  dark ? 'text-white/80' : 'text-slate-600',
                )}
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">
                    {user.email || 'No email on file'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="size-3.5 opacity-70" />
                  {staffPositionLabel(user)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 opacity-70" />
                  {user.branchName || 'No branch'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {!user.isStudent ? (
              <Button
                variant={dark ? 'secondary' : 'ink'}
                onClick={() => void navigate(staffEditPath(entity, user.id))}
              >
                <Pencil className="size-4" />
                Edit profile
              </Button>
            ) : user.studentId ? (
              <Button
                variant={dark ? 'secondary' : 'ink'}
                onClick={() =>
                  void navigate({
                    to: '/students/$studentId',
                    params: { studentId: user.studentId! },
                  })
                }
              >
                <ExternalLink className="size-4" />
                Open student record
              </Button>
            ) : null}
            {!user.isStudent ? (
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete ${user.fullName}`}
                title={`Delete ${user.fullName}`}
                className={cn(
                  'inline-flex size-11 items-center justify-center rounded-full transition hover:bg-rose-500 hover:text-white',
                  dark ? 'bg-white/15 text-white' : 'bg-white text-rose-500 shadow-sm',
                )}
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
