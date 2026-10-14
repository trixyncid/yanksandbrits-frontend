import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { cn } from '../../../shared/lib/cn'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import { fetchTutorAssignedSessions } from '../api/tutor-dashboard-api'

export function TutorAssignedSessions({ className }: { className?: string }) {
  const sessionsQuery = useQuery({
    queryKey: ['tutor-portal', 'assigned-sessions'],
    queryFn: fetchTutorAssignedSessions,
  })

  const sessions = sessionsQuery.data ?? []
  const totalSessions = sessions.reduce((sum, session) => sum + session.sessions, 0)

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Your classes"
        description="Programs and session counts assigned to you."
        icon={<BookOpen className="size-4" />}
        action={
          sessions.length > 0 ? (
            <DashboardChip tone="brand">{totalSessions} sessions</DashboardChip>
          ) : null
        }
      />

      {sessionsQuery.isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-3xl bg-canvas/70" />
          ))}
        </div>
      ) : sessionsQuery.isError ? (
        <div className="rounded-3xl bg-rose-50 px-4 py-5">
          <p className="text-sm font-semibold text-rose-700">
            We couldn&apos;t load your classes
          </p>
          <p className="mt-1 text-sm text-rose-600/80">
            {getApiErrorMessage(sessionsQuery.error)}
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <DashboardEmptyState message="No classes have been assigned to you yet." />
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {sessions.map((session, index) => {
            const program = [session.programCode, session.programTitle]
              .filter(Boolean)
              .join(' · ')
            const students = session.students.join(', ')
            return (
              <li
                key={session.id}
                className="flex items-start gap-3 rounded-3xl bg-canvas/70 px-3 py-3"
              >
                <span
                  className={cn(
                    'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
                    index === 0 ? 'bg-brand-500 text-white' : 'bg-white text-brand-700',
                  )}
                  title={`${session.sessions} ${session.sessions === 1 ? 'session' : 'sessions'}`}
                >
                  {session.sessions}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {session.section}
                  </p>
                  {program ? (
                    <p className="truncate text-xs font-medium text-slate-500">
                      {program}
                    </p>
                  ) : null}
                  {students ? (
                    <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                      <Users className="mt-0.5 size-3 shrink-0" />
                      <span className="line-clamp-2">{students}</span>
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-slate-500">
                  {session.sessions === 1 ? 'session' : 'sessions'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardPanel>
  )
}
