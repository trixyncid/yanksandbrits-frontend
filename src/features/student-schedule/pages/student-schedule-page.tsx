import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle, CalendarDays, CalendarRange, Copy, Users } from 'lucide-react'
import { useMemo } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  ListErrorState,
  ListLoadingState,
  PageHero,
  type HeroStat,
} from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { DashboardEmptyState, DashboardPanel } from '../../admin/components/dashboard-section'
import {
  fetchStudentSchedule,
  studentScheduleQueryKeys,
  type StudentScheduleFilters,
  type StudentScheduleRange,
} from '../api/student-schedule-api'
import { AttentionStrip, ScheduleAgenda } from '../components/student-schedule-parts'
import { buildCopyText, groupSessionsByDay } from '../lib/schedule-days'

type ScheduleSearch = { range?: StudentScheduleRange; student?: string; program?: string }

const RANGES: { value: StudentScheduleRange; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past 30 days' },
]

function daysFromToday(value: string) {
  const start = new Date(value)
  const today = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((startDay.getTime() - todayDay.getTime()) / 86_400_000)
}

export default function StudentSchedulePage() {
  const search = useSearch({ strict: false }) as ScheduleSearch
  const navigate = useNavigate()
  const filters: StudentScheduleFilters = {
    range: search.range === 'past' ? 'past' : 'upcoming',
    student: search.student,
    program: search.program,
  }
  const upcoming = filters.range === 'upcoming'

  const scheduleQuery = useQuery({
    queryKey: studentScheduleQueryKeys.list(filters),
    queryFn: () => fetchStudentSchedule(filters),
    placeholderData: keepPreviousData,
  })
  const schedule = scheduleQuery.data

  function setFilters(next: Partial<ScheduleSearch>) {
    void navigate({
      to: '/student-schedule',
      search: { ...search, ...next } as never,
      replace: true,
    })
  }

  const buckets = useMemo(
    () => groupSessionsByDay(schedule?.sessions ?? [], upcoming),
    [schedule?.sessions, upcoming],
  )

  const studentOptions = useMemo(
    () =>
      (schedule?.students ?? []).map((student) => ({
        value: student.id,
        label: student.pin ? `${student.pin} | ${student.name}` : student.name,
        keywords: `${student.pin} ${student.name}`,
      })),
    [schedule?.students],
  )
  const selectedStudent = schedule?.students.find((student) => student.id === filters.student)

  const stats: HeroStat[] = useMemo(() => {
    const sessions = (schedule?.sessions ?? []).filter((session) => session.status === 'ongoing')
    const today = sessions.filter((session) => daysFromToday(session.start) === 0)
    const week = sessions.filter((session) => {
      const offset = daysFromToday(session.start)
      return offset >= 0 && offset < 7
    })
    const studentsThisWeek = new Set(
      week.flatMap((session) => session.myStudents.map((student) => student.id)),
    )
    return [
      {
        id: 'today',
        label: 'Classes today',
        icon: CalendarDays,
        value: schedule && upcoming ? today.length : '–',
        caption: upcoming ? undefined : 'Switch to Upcoming',
      },
      {
        id: 'week',
        label: 'Next 7 days',
        icon: CalendarRange,
        value: schedule && upcoming ? week.length : '–',
        caption: upcoming ? `${studentsThisWeek.size} of your students` : undefined,
      },
      {
        id: 'students',
        label: 'Your students',
        icon: Users,
        value: schedule ? schedule.students.length : '–',
      },
      {
        id: 'attention',
        label: 'Needs attention',
        icon: AlertCircle,
        value: schedule ? schedule.attention.length : '–',
        caption: schedule?.attention.length ? 'See the list below' : 'All on track',
      },
    ]
  }, [schedule, upcoming])

  async function copySchedule() {
    if (!schedule) return
    const text = buildCopyText(schedule.sessions, selectedStudent?.name ?? null)
    try {
      await navigator.clipboard.writeText(text)
      notify('success', {
        title: 'Schedule copied',
        description: 'Paste it into your chat with the student or parent.',
      })
    } catch {
      notify('error', {
        title: 'Unable to copy',
        description: 'Your browser blocked the clipboard. Try again.',
      })
    }
  }

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="My students"
          title="Student schedule"
          description="Classes your students have booked, what happened in the last 30 days, and who needs a follow-up."
          theme="mist"
          pattern="rings"
          stats={stats}
        />

        {schedule ? (
          <AttentionStrip
            items={schedule.attention}
            onSelectStudent={(studentId) => setFilters({ student: studentId })}
          />
        ) : null}

        <DashboardPanel>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-full bg-canvas p-1" role="tablist" aria-label="Range">
                {RANGES.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    role="tab"
                    aria-selected={filters.range === range.value}
                    onClick={() => setFilters({ range: range.value })}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                      filters.range === range.value
                        ? 'bg-ink text-white'
                        : 'text-slate-600 hover:text-ink',
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <SearchableSelect
                value={filters.student ?? ''}
                options={studentOptions}
                onChange={(value) => setFilters({ student: value || undefined })}
                placeholder="All your students"
                searchPlaceholder="Search your students..."
                emptyMessage="No students found"
                ariaLabel="Student"
                clearable
                className="sm:w-64"
              />
              <Select
                aria-label="Program"
                value={filters.program ?? ''}
                onChange={(event) => setFilters({ program: event.target.value || undefined })}
              >
                <option value="">All programs</option>
                {(schedule?.programs ?? []).map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </Select>
            </div>
            {upcoming ? (
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={() => void copySchedule()}
                disabled={!schedule}
              >
                <Copy className="size-3.5" />
                Copy for parents
              </Button>
            ) : null}
          </div>
        </DashboardPanel>

        {scheduleQuery.isLoading && !schedule ? <ListLoadingState rows={4} /> : null}

        {scheduleQuery.isError ? (
          <ListErrorState
            title="Unable to load your students' schedule"
            description={getApiErrorMessage(scheduleQuery.error)}
            onRetry={() => void scheduleQuery.refetch()}
          />
        ) : null}

        {schedule && !scheduleQuery.isError ? (
          <div className={cn(scheduleQuery.isFetching && 'opacity-70 transition-opacity')}>
            {buckets.length > 0 ? (
              <ScheduleAgenda buckets={buckets} />
            ) : (
              <DashboardPanel>
                <DashboardEmptyState
                  message={
                    schedule.students.length === 0
                      ? 'You have no students yet. Students you counsel appear here once they enroll.'
                      : upcoming
                        ? 'No classes booked for these students yet. Check "Needs attention" for who to follow up with.'
                        : 'No classes in the last 30 days for this selection.'
                  }
                />
              </DashboardPanel>
            )}
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
