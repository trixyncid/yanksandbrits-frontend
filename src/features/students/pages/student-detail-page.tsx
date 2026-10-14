import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  differenceInCalendarMonths,
  differenceInYears,
  format,
} from 'date-fns'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plane,
  Trash2,
  UserRound,
  UserX,
  Users,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { StudentProgramsTab } from '../components/student-programs-tab'
import { StudentPaymentsTab } from '../components/student-payments-tab'
import { deleteStudent } from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import { useStudentQuery } from '../hooks/use-student-query'
import type { StudentDetail, StudentGender } from '../types/student'

type DetailTab = 'profile' | 'programs' | 'payments'

function formatDate(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return format(date, 'MMM d, yyyy')
}

function formatDateTime(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return format(date, 'MMM d, yyyy · h:mm a')
}

function genderLabel(gender: StudentGender) {
  if (gender === 'M') return 'Male'
  if (gender === 'F') return 'Female'
  return ''
}

function ageLabel(birthDate: string) {
  if (!birthDate) return ''
  const date = new Date(birthDate)
  if (Number.isNaN(date.getTime())) return ''
  const years = differenceInYears(new Date(), date)
  if (years < 0 || years > 120) return ''
  return `${years} years old`
}

function tenureLabel(enrollmentDate: string) {
  if (!enrollmentDate) return ''
  const start = new Date(enrollmentDate)
  if (Number.isNaN(start.getTime())) return ''
  const months = differenceInCalendarMonths(new Date(), start)
  if (months < 0) return ''
  if (months < 1) return 'Enrolled this month'
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} enrolled`
  }
  const years = Math.floor(months / 12)
  const remainder = months % 12
  const yearText = `${years} year${years === 1 ? '' : 's'}`
  if (remainder === 0) return `${yearText} enrolled`
  return `${yearText} ${remainder} mo enrolled`
}

function accountCopy(student: StudentDetail) {
  if (!student.hasAccount) {
    return {
      label: 'No portal login',
      detail: 'Student cannot sign in yet',
      tone: 'neutral' as const,
    }
  }
  if (student.accountActive === false) {
    return {
      label: 'Login disabled',
      detail: 'Portal account is turned off',
      tone: 'warn' as const,
    }
  }
  return {
    label: 'Portal login',
    detail: 'Student can sign in',
    tone: 'ok' as const,
  }
}

function RecordedValue({ value }: { value: string }) {
  if (!value) {
    return <span className="font-medium text-slate-400">Not recorded</span>
  }

  return <span className="font-semibold tracking-tight text-ink">{value}</span>
}

function Fact({
  icon: Icon,
  label,
  value,
  href,
  wide,
}: {
  icon: typeof Mail
  label: string
  value: string
  href?: string
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 gap-3 rounded-2xl bg-canvas px-3.5 py-3',
        wide && 'sm:col-span-2',
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm break-words">
          {href && value ? (
            <a
              href={href}
              className="font-semibold tracking-tight text-brand-700 underline-offset-2 hover:text-brand-500 hover:underline"
            >
              {value}
            </a>
          ) : (
            <RecordedValue value={value} />
          )}
        </p>
      </div>
    </div>
  )
}

function Panel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Mail
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
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
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function SnapshotTile({
  icon: Icon,
  label,
  value,
  hint,
  onClick,
  progress,
}: {
  icon: typeof Mail
  label: string
  value: string
  hint: string
  onClick?: () => void
  /** 0–100; draws a slim bar under the value. */
  progress?: number
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-4 rounded-3xl bg-white p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
        {label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
            {hint}
          </p>
          {progress !== undefined ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          ) : null}
        </div>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={`Open ${label.toLowerCase()}`}
            title={`Open ${label.toLowerCase()}`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-brand-500 hover:text-white"
          >
            <ArrowUpRight className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function StudentProfile({ student }: { student: StudentDetail }) {
  const birth = formatDate(student.birthDate)
  const age = ageLabel(student.birthDate)
  const enrolled = formatDate(student.enrollmentDate)

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel
          icon={Phone}
          title="Contact"
          description="How staff reach this student and their family."
        >
          <Fact
            icon={Mail}
            label="Email"
            value={student.email}
            href={student.email ? `mailto:${student.email}` : undefined}
          />
          <Fact
            icon={Phone}
            label="Mobile"
            value={student.mobilePhone}
            href={student.mobilePhone ? `tel:${student.mobilePhone}` : undefined}
          />
          <Fact
            icon={Users}
            label="Parents"
            value={student.homePhone}
            href={student.homePhone ? `tel:${student.homePhone}` : undefined}
          />
          <Fact
            icon={Phone}
            label="Other phone"
            value={student.othersPhone}
            href={
              student.othersPhone ? `tel:${student.othersPhone}` : undefined
            }
          />
          <Fact icon={MapPin} label="Address" value={student.address} wide />
        </Panel>

        <Panel
          icon={UserRound}
          title="Personal"
          description="Identity details used on documents and scheduling."
        >
          <Fact
            icon={CalendarDays}
            label="Birth date"
            value={birth && age ? `${birth} · ${age}` : birth}
          />
          <Fact icon={MapPin} label="Birth place" value={student.birthPlace} />
          <Fact
            icon={UserRound}
            label="Gender"
            value={genderLabel(student.gender)}
          />
          <Fact
            icon={Briefcase}
            label="Occupation"
            value={student.occupationName}
          />
          <Fact
            icon={GraduationCap}
            label="Institution"
            value={student.institutionName}
            wide
          />
        </Panel>

        <Panel
          icon={Plane}
          title="Study destination"
          description="Where this student is heading after the program."
        >
          <Fact icon={Globe} label="Country" value={student.country} />
          <Fact
            icon={GraduationCap}
            label="University"
            value={student.university}
          />
          <Fact icon={BookOpen} label="Major" value={student.major} wide />
        </Panel>

        <Panel
          icon={GraduationCap}
          title="Enrollment"
          description="How this student joined and who looks after them."
        >
          <Fact icon={CalendarDays} label="Enrollment date" value={enrolled} />
          <Fact icon={UserRound} label="Counsellor" value={student.counsellor} />
          <Fact icon={Building2} label="Branch" value={student.branch} />
          <Fact
            icon={Users}
            label="Referral"
            value={student.referralMarketing}
          />
          <Fact icon={Hash} label="Guest number" value={student.grn} wide />
        </Panel>
      </div>

      <div className="flex flex-col gap-2 rounded-3xl bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-8">
        <p>
          Created{' '}
          <span className="font-semibold text-ink">
            {formatDateTime(student.createdAt) || '—'}
          </span>
          {student.createdBy ? ` by ${student.createdBy}` : ''}
        </p>
        <p>
          Last updated{' '}
          <span className="font-semibold text-ink">
            {formatDateTime(student.updatedAt) || '—'}
          </span>
          {student.updatedBy ? ` by ${student.updatedBy}` : ''}
        </p>
      </div>
    </div>
  )
}

function StudentDetailSkeleton() {
  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl animate-pulse space-y-3" aria-busy="true">
        <div className="h-28 rounded-[1.75rem] bg-white" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-white" />
          ))}
        </div>
        <div className="h-11 w-72 max-w-full rounded-full bg-white" />
        <div className="h-[28rem] rounded-[1.75rem] bg-white" />
      </div>
    </AdminShell>
  )
}

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { studentId } = useParams({ strict: false }) as { studentId: string }
  const studentQuery = useStudentQuery(studentId)
  const [tab, setTab] = useState<DetailTab>('profile')

  if (studentQuery.isLoading) {
    return <StudentDetailSkeleton />
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={UserX}
            title="Student not found"
            description="This student may have been deleted, or the link is no longer valid."
            action={
              <Button
                variant="ink"
                onClick={() => void navigate({ to: '/students' })}
              >
                <ArrowLeft className="size-4" />
                Back to students
              </Button>
            }
          />
        </div>
      </AdminShell>
    )
  }

  const student = studentQuery.data
  const account = accountCopy(student)
  const ongoing = student.programs.filter(
    (program) => program.status === 'ongoing',
  ).length
  const programCount = student.programs.length
  const sessions = student.programs.reduce(
    (total, program) => total + program.sessions,
    0,
  )
  const sessionsUsed = student.programs.reduce(
    (total, program) => total + program.sessionsUsed,
    0,
  )
  const sessionProgress =
    sessions > 0 ? Math.round((sessionsUsed / sessions) * 100) : 0
  const enrolled = formatDate(student.enrollmentDate)
  const tenure = tenureLabel(student.enrollmentDate)
  const recordLabel = student.pin
    ? `${student.fullName} (${student.pin})`
    : student.fullName

  function handleDelete() {
    requestDeleteConfirm({
      title: `Delete ${student.fullName}?`,
      description: `This will permanently remove the student record for ${recordLabel}. This cannot be undone.`,
      confirmLabel: 'Delete student',
      onConfirm: () => {
        void deleteStudent(student.id)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: studentQueryKeys.all,
            })
            notify('success', {
              title: 'Student deleted',
              description: `${recordLabel} has been removed.`,
            })
            void navigate({ to: '/students' })
          })
          .catch((error) => {
            notify('error', {
              title: 'Unable to delete student',
              description: getApiErrorMessage(error),
            })
          })
      },
    })
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', count: null },
    { id: 'programs' as const, label: 'Programs', count: programCount },
    { id: 'payments' as const, label: 'Payments', count: null },
  ]

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/students"
          backLabel="Students"
          title={student.fullName}
          description={
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              {student.pin ? (
                <span className="font-mono">{student.pin}</span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3.5" />
                {student.branch || 'No branch'}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5',
                  account.tone === 'warn' && 'text-amber-200',
                )}
                title={account.detail}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    account.tone === 'ok' && 'bg-emerald-300',
                    account.tone === 'warn' && 'bg-amber-300',
                    account.tone === 'neutral' && 'bg-white/50',
                  )}
                />
                {account.label}
              </span>
            </span>
          }
          icon={GraduationCap}
          theme="harbor"
          pattern="waves"
          badge={
            <span
              className={
                student.status === 'active'
                  ? 'rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white'
                  : 'rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/70'
              }
            >
              {student.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          }
          actions={
            <>
              <Can module="students" action="change">
                <button
                  type="button"
                  onClick={() =>
                    void navigate({
                      to: '/students/$studentId/edit',
                      params: { studentId: student.id },
                    })
                  }
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-ink hover:text-white"
                >
                  <Pencil className="size-4" />
                  Edit profile
                </button>
              </Can>
              <Can module="students" action="delete">
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label={`Delete ${student.fullName}`}
                  title="Delete student"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-rose-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </Can>
            </>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SnapshotTile
            icon={CalendarDays}
            label="Enrolled"
            value={enrolled || 'Not set'}
            hint={tenure || 'Enrollment date missing'}
          />
          <SnapshotTile
            icon={UserRound}
            label="Counsellor"
            value={student.counsellor || 'Unassigned'}
            hint="Education counsellor"
          />
          <SnapshotTile
            icon={BookOpen}
            label="Programs"
            value={programCount === 0 ? 'None yet' : `${programCount} enrolled`}
            hint={
              programCount === 0
                ? 'Add a program to track sessions'
                : `${ongoing} ongoing`
            }
            onClick={() => setTab('programs')}
          />
          <SnapshotTile
            icon={Hash}
            label="Sessions"
            value={sessions === 0 ? 'None yet' : `${sessionsUsed} / ${sessions}`}
            hint={
              sessions === 0
                ? 'No sessions on file'
                : `${sessionProgress}% complete`
            }
            progress={sessions === 0 ? undefined : sessionProgress}
            onClick={() => setTab('programs')}
          />
        </div>

        <div className="overflow-x-auto">
          <div
            role="tablist"
            aria-label="Student sections"
            className="inline-flex gap-1 rounded-full bg-white p-1"
          >
            {tabs.map((item) => {
              const selected = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition',
                    selected
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-slate-500 hover:bg-canvas hover:text-ink',
                  )}
                >
                  {item.label}
                  {item.count !== null ? (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                        selected
                          ? 'bg-white/20 text-white'
                          : 'bg-canvas text-slate-500',
                      )}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div role="tabpanel" className="animate-in fade-in">
          {tab === 'profile' ? <StudentProfile student={student} /> : null}
          {tab === 'programs' ? <StudentProgramsTab student={student} /> : null}
          {tab === 'payments' ? <StudentPaymentsTab student={student} /> : null}
        </div>
      </div>
    </AdminShell>
  )
}
