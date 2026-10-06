import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  differenceInCalendarMonths,
  differenceInYears,
  format,
} from 'date-fns'
import {
  ArrowLeft,
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
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { StudentProgramsTab } from '../components/student-programs-tab'
import { StudentPaymentsTab } from '../components/student-payments-tab'
import { deleteStudent, getStudentInitials } from '../api/students-api'
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

  return (
    <span className="font-semibold tracking-tight text-slate-900">{value}</span>
  )
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
    <div className={cn('flex min-w-0 gap-3', wide && 'sm:col-span-2')}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F8FF] text-[#253CA1]">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm break-words">
          {href && value ? (
            <a
              href={href}
              className="font-semibold tracking-tight text-[#1B2A5A] underline-offset-2 hover:text-[#253CA1] hover:underline"
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
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function SnapshotCell({
  label,
  value,
  hint,
  onClick,
}: {
  label: string
  value: string
  hint: string
  onClick?: () => void
}) {
  const content = (
    <>
      <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>
    </>
  )
  const cellClass =
    'min-w-0 border-[#E4EAF6] px-5 py-4 nth-[n+3]:border-t even:border-l sm:border-t-0 sm:nth-[n+3]:border-t-0 sm:border-l sm:first:border-l-0'

  if (!onClick) {
    return <div className={cellClass}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(cellClass, 'text-left transition hover:bg-white/80')}
    >
      {content}
    </button>
  )
}

function StudentProfile({ student }: { student: StudentDetail }) {
  const birth = formatDate(student.birthDate)
  const age = ageLabel(student.birthDate)
  const enrolled = formatDate(student.enrollmentDate)

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Contact"
          description="The channels staff use to reach this student and their family."
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
          title="Study destination"
          description="Where this student is heading after the program."
        >
          <Fact icon={Globe} label="Country" value={student.country} />
          <Fact
            icon={GraduationCap}
            label="University"
            value={student.university}
          />
          <Fact
            icon={BookOpen}
            label="Major"
            value={student.major}
            wide
          />
        </Panel>

        <Panel
          title="Enrollment"
          description="How this student entered and who looks after them."
        >
          <Fact
            icon={CalendarDays}
            label="Enrollment date"
            value={enrolled}
          />
          <Fact
            icon={UserRound}
            label="Counsellor"
            value={student.counsellor}
          />
          <Fact icon={Building2} label="Branch" value={student.branch} />
          <Fact
            icon={Users}
            label="Referral"
            value={student.referralMarketing}
          />
          <Fact icon={Hash} label="Guest number" value={student.grn} wide />
        </Panel>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-8">
        <p>
          Created{' '}
          <span className="font-semibold text-slate-700">
            {formatDateTime(student.createdAt) || '—'}
          </span>
          {student.createdBy ? ` by ${student.createdBy}` : ''}
        </p>
        <p>
          Last updated{' '}
          <span className="font-semibold text-slate-700">
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
    <AdminShell>
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-5 w-24 rounded-full bg-slate-200" />
        <div className="h-72 rounded-[1.75rem] bg-white" />
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
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
            <UserRound className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Student not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This student may have been deleted, or the link is no longer valid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/students' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to students
          </Button>
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

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete student?',
      description: `This will permanently remove ${student.fullName} (${student.pin}). This action cannot be undone.`,
      onConfirm: () => {
        void deleteStudent(student.id)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: studentQueryKeys.all,
            })
            notify('success', {
              title: 'Student deleted',
              description: `${student.pin} has been removed.`,
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
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]"
        >
          <ArrowLeft className="size-4" />
          Students
        </Link>

        <section className="overflow-hidden rounded-[1.75rem] border border-[#D7E4F6] bg-[linear-gradient(160deg,#F7F9FF_0%,#FFFFFF_55%,#EEF3FF_100%)] shadow-[0_24px_48px_-28px_rgba(66,116,185,0.35)]">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(37,60,161,0.18),transparent_70%)]" />
                <div className="relative inline-flex size-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-2xl font-bold tracking-wide text-white shadow-lg shadow-[#253CA1]/25 sm:size-24">
                  {getStudentInitials(student.fullName)}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#253CA1] uppercase ring-1 ring-[#C8D4F5]">
                    {student.pin}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                      student.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                        : 'bg-rose-50 text-rose-700 ring-rose-100',
                    )}
                  >
                    {student.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                      account.tone === 'ok' &&
                        'bg-sky-50 text-sky-800 ring-sky-100',
                      account.tone === 'warn' &&
                        'bg-amber-50 text-amber-800 ring-amber-100',
                      account.tone === 'neutral' &&
                        'bg-slate-50 text-slate-600 ring-slate-200',
                    )}
                  >
                    {account.label}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {student.fullName}
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  {student.email ? (
                    <a
                      href={`mailto:${student.email}`}
                      className="inline-flex min-w-0 items-center gap-1.5 hover:text-[#253CA1]"
                    >
                      <Mail className="size-3.5 shrink-0 text-[#253CA1]" />
                      <span className="truncate">{student.email}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Mail className="size-3.5" />
                      No email
                    </span>
                  )}
                  {student.mobilePhone ? (
                    <a
                      href={`tel:${student.mobilePhone}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#253CA1]"
                    >
                      <Phone className="size-3.5 text-[#253CA1]" />
                      {student.mobilePhone}
                    </a>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-[#253CA1]" />
                    {student.branch || 'No branch'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  void navigate({
                    to: '/students/$studentId/edit',
                    params: { studentId: student.id },
                  })
                }
              >
                <Pencil className="size-3.5" />
                Edit profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={handleDelete}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-[#D7E4F6]/80 bg-white/40 sm:grid-cols-4">
            <SnapshotCell
              label="Enrolled"
              value={enrolled || 'Not set'}
              hint={tenure || 'Enrollment date missing'}
            />
            <SnapshotCell
              label="Counsellor"
              value={student.counsellor || 'Unassigned'}
              hint="Education counsellor"
            />
            <SnapshotCell
              label="Programs"
              value={
                programCount === 0
                  ? 'None yet'
                  : `${programCount} enrolled`
              }
              hint={
                programCount === 0
                  ? 'Add a program to track sessions'
                  : `${ongoing} ongoing`
              }
              onClick={() => setTab('programs')}
            />
            <SnapshotCell
              label="Sessions"
              value={sessions === 0 ? 'None yet' : `${sessionsUsed} / ${sessions}`}
              hint={
                sessions === 0
                  ? 'No sessions on file'
                  : `${sessionProgress}% complete`
              }
              onClick={() => setTab('programs')}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
          <div
            role="tablist"
            aria-label="Student sections"
            className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 pt-3"
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
                    'relative shrink-0 rounded-t-xl px-4 py-3 text-sm font-semibold transition',
                    selected
                      ? 'text-[#253CA1]'
                      : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.label}
                    {item.count !== null ? (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                          selected
                            ? 'bg-[#E8EEFF] text-[#1B2A5A]'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {item.count}
                      </span>
                    ) : null}
                  </span>
                  {selected ? (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#253CA1]" />
                  ) : null}
                </button>
              )
            })}
          </div>

          {tab === 'profile' ? (
            <div className="bg-[#F4F7FB]">
              <StudentProfile student={student} />
            </div>
          ) : null}
          {tab === 'programs' ? <StudentProgramsTab student={student} /> : null}
          {tab === 'payments' ? (
            <StudentPaymentsTab student={student} />
          ) : null}
        </section>
      </div>
    </AdminShell>
  )
}
