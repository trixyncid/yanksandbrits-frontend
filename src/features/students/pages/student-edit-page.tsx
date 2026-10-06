import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Pencil } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentToFormValues } from '../api/students-api'
import { StudentForm } from '../components/student-form'
import { useStudentForm } from '../hooks/use-student-form'
import { useStudentQuery } from '../hooks/use-student-query'
import type { StudentDetail, StudentFormValues } from '../types/student'

export default function StudentEditPage() {
  const navigate = useNavigate()
  const { studentId } = useParams({ strict: false }) as { studentId: string }
  const studentQuery = useStudentQuery(studentId)

  if (studentQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-[#E8EEFF]" />
          <p className="mt-4 text-sm text-slate-500">Loading student...</p>
        </div>
      </AdminShell>
    )
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
            <Pencil className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Student not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This student may have been removed or the link is invalid.
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

  return (
    <StudentEditForm
      student={student}
      initialValues={studentToFormValues(student)}
    />
  )
}

function StudentEditForm({
  student,
  initialValues,
}: {
  student: StudentDetail
  initialValues: StudentFormValues
}) {
  const form = useStudentForm({
    mode: 'edit',
    studentId: student.id,
    initialValues,
  })
  const isActive = form.values.status === 'active'

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-sm font-bold tracking-wide text-white shadow-md shadow-[#253CA1]/25">
                {getInitials(form.values.fullName || student.fullName)}
              </div>
              <div className="min-w-0">
                <Link
                  to="/students/$studentId"
                  params={{ studentId: student.id }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#253CA1]"
                >
                  <ArrowLeft className="size-3.5" />
                  Student profile
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {form.values.fullName.trim() || student.fullName}
                  </h2>
                  {form.values.pin.trim() ? (
                    <span className="rounded-full bg-[#E8EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#253CA1]">
                      {form.values.pin.trim()}
                    </span>
                  ) : null}
                  <span
                    className={
                      isActive
                        ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200'
                        : 'rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200'
                    }
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Update this profile. Required fields stay marked. Optional
                  destination details can stay blank.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={form.cancel}
            >
              Go Back
            </Button>
          </div>
        </section>

        <StudentForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          meta={{
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
            createdBy: student.createdBy,
            updatedBy: student.updatedBy,
          }}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
        />
      </div>
    </AdminShell>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
