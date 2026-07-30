import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentToFormValues } from '../api/students-api'
import { StudentForm } from '../components/student-form'
import { useStudentForm } from '../hooks/use-student-form'
import { useStudentQuery } from '../hooks/use-student-query'
import type { StudentFormValues } from '../types/student'

export default function StudentEditPage() {
  const navigate = useNavigate()
  const { studentId } = useParams({ strict: false }) as { studentId: string }
  const studentQuery = useStudentQuery(studentId)

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
          <h2 className="text-2xl font-bold text-slate-900">Student not found</h2>
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
      studentId={student.id}
      initialValues={studentToFormValues(student)}
      pin={student.pin}
      fullName={student.fullName}
    />
  )
}

function StudentEditForm({
  studentId,
  initialValues,
  pin,
  fullName,
}: {
  studentId: string
  initialValues: StudentFormValues
  pin: string
  fullName: string
}) {
  const form = useStudentForm({
    mode: 'edit',
    studentId,
    initialValues,
  })

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/students/$studentId"
              params={{ studentId }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              {pin} | {fullName}
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Student
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit profile details for this enrolled student.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <StudentForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            onChange={form.updateField}
            onSubmit={form.submit}
            onCancel={form.cancel}
          />
        </div>
      </div>
    </AdminShell>
  )
}
