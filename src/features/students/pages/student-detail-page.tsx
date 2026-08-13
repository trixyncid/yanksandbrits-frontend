import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Building2,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { StudentProgramsTab } from '../components/student-programs-tab'
import { StudentPaymentsTab } from '../components/student-payments-tab'
import { StudentAccountCard } from '../components/student-account-card'
import { deleteStudent, getStudentInitials } from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import { useStudentQuery } from '../hooks/use-student-query'

type DetailTab = 'programs' | 'payments'

function formatDate(value: string) {
  if (!value) {
    return '—'
  }

  return format(new Date(value), 'MMM d, yyyy')
}

function formatDateTime(value: string) {
  if (!value) {
    return '—'
  }

  return format(new Date(value), 'MMM d, yyyy · h:mm a')
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
        {value || '—'}
      </dd>
    </div>
  )
}

export default function StudentDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { studentId } = useParams({ strict: false }) as { studentId: string }
  const studentQuery = useStudentQuery(studentId)
  const [tab, setTab] = useState<DetailTab>('programs')

  if (studentQuery.isLoading) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-sm text-slate-500">
          Loading student...
        </div>
      </AdminShell>
    )
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
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

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
          >
            <ArrowLeft className="size-4" />
            Students
          </Link>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] border border-[#D7E4F6] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_42%,#EDF4FF_100%)] shadow-[0_24px_48px_-28px_rgba(66,116,185,0.35)]">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(66,116,185,0.22),transparent_70%)]" />
                <div className="relative inline-flex size-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(160deg,#4274B9_0%,#2F5A94_100%)] text-2xl font-bold tracking-wide text-white shadow-lg shadow-[#4274B9]/30 sm:size-24">
                  {getStudentInitials(student.fullName)}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#4274B9] uppercase ring-1 ring-[#BED2F2]">
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
                  {student.hasAccount ? (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                        student.accountActive
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          : 'bg-amber-50 text-amber-700 ring-amber-100',
                      )}
                    >
                      {student.accountActive
                        ? 'Portal Active'
                        : 'Portal Inactive'}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {student.fullName}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {student.email || 'No email on file'}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-[#4274B9]" />
                    {student.branch}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5 text-[#4274B9]" />
                    {student.counsellor}
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
                Edit Profile
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
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="animate-in fade-in slide-in-from-bottom-2 delay-75 space-y-6 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Student Information
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Personal and contact details for this student.
              </p>
            </div>

            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailItem label="PIN" value={student.pin} />
              <DetailItem label="Full name" value={student.fullName} />
              <DetailItem label="Email address" value={student.email || '—'} />
              <DetailItem
                label="Birth date"
                value={formatDate(student.birthDate)}
              />
              <DetailItem label="Birth place" value={student.birthPlace} />
              <DetailItem
                label="Gender"
                value={student.gender === 'M' ? 'Male' : 'Female'}
              />
              <DetailItem
                label="Address"
                value={student.address}
                className="sm:col-span-2"
              />
              <DetailItem label="Phone (Mobile)" value={student.mobilePhone} />
              <DetailItem label="Phone (Home)" value={student.homePhone} />
              <DetailItem label="Phone (Others)" value={student.othersPhone} />
              <DetailItem
                label="Occupation"
                value={student.occupationName}
              />
              <DetailItem
                label="Institution"
                value={student.institutionName}
              />
            </dl>
          </section>

          <aside className="animate-in fade-in slide-in-from-bottom-2 delay-100 space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              Other Information
            </h3>
            <dl className="space-y-4">
              <DetailItem
                label="Created at"
                value={formatDateTime(student.createdAt)}
              />
              <DetailItem
                label="Updated at"
                value={formatDateTime(student.updatedAt)}
              />
              <DetailItem label="Created by" value={student.createdBy} />
              <DetailItem label="Updated by" value={student.updatedBy} />
              <DetailItem label="Branch" value={student.branch} />
              <DetailItem
                label="Education counsellor"
                value={student.counsellor}
              />
              <DetailItem
                label="Referral"
                value={student.referralMarketing}
              />
              <DetailItem label="Guest number" value={student.grn} />
              <DetailItem
                label="Enrollment date"
                value={formatDate(student.enrollmentDate)}
              />
            </dl>
          </aside>
        </div>

        <StudentAccountCard student={student} />

        <section className="animate-in fade-in slide-in-from-bottom-2 delay-150 space-y-4">
          <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:max-w-md">
            {(
              [
                { id: 'programs', label: 'Programs' },
                { id: 'payments', label: 'Payment History' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                  tab === item.id
                    ? 'bg-[#4274B9] text-white shadow-md shadow-[#4274B9]/25'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
            {tab === 'programs' ? (
              <StudentProgramsTab student={student} />
            ) : (
              <StudentPaymentsTab student={student} />
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
