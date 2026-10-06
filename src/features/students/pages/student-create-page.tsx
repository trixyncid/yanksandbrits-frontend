import { Link, useSearch } from '@tanstack/react-router'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { mapGenderToApi } from '../../../shared/api/choices'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { fetchProspectiveStudent } from '../../prospective-students/api/prospective-students-api'
import { emptyStudentFormValues } from '../api/students-api'
import { StudentForm } from '../components/student-form'
import { useStudentForm } from '../hooks/use-student-form'
import type { StudentFormValues } from '../types/student'

function todayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function StudentCreatePage() {
  const { prospectiveStudentId } = useSearch({ strict: false }) as {
    prospectiveStudentId?: string
  }
  const [initialValues, setInitialValues] = useState<StudentFormValues | null>(
    prospectiveStudentId ? null : emptyStudentFormValues,
  )
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!prospectiveStudentId) {
      return
    }

    let cancelled = false

    void fetchProspectiveStudent(prospectiveStudentId)
      .then((prospect) => {
        if (cancelled) {
          return
        }

        if (prospect.isStudent || prospect.status === 'enrolled') {
          setLoadError('This prospective student is already enrolled.')
          setInitialValues(emptyStudentFormValues)
          return
        }

        if (!prospect.canEnroll) {
          setLoadError(
            'Enroll requires a student payment. A pending plan is enough; the student stays inactive until an installment is approved.',
          )
          setInitialValues(emptyStudentFormValues)
          return
        }

        if (cancelled) {
          return
        }

        setInitialValues({
          ...emptyStudentFormValues,
          fullName: prospect.fullName,
          email: prospect.email,
          gender: mapGenderToApi(prospect.gender ?? ''),
          address: prospect.address,
          mobilePhone: prospect.phone,
          enrollmentDate: todayDateString(),
          grn: prospect.srNumber,
          counsellorId: prospect.marketingId ?? '',
          branchId: prospect.branchId ?? '',
          status: 'inactive',
        })
      })
      .catch((error) => {
        if (cancelled) {
          return
        }
        const message = getApiErrorMessage(error)
        setLoadError(message)
        setInitialValues(emptyStudentFormValues)
        notify('error', {
          title: 'Unable to load prospective student',
          description: message,
        })
      })

    return () => {
      cancelled = true
    }
  }, [prospectiveStudentId])

  if (initialValues == null) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-[#E8EEFF]" />
          <p className="mt-4 text-sm text-slate-500">
            Loading prospective student details...
          </p>
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentCreateForm
      prospectiveStudentId={prospectiveStudentId}
      initialValues={initialValues}
      loadError={loadError}
    />
  )
}

function StudentCreateForm({
  prospectiveStudentId,
  initialValues,
  loadError,
}: {
  prospectiveStudentId?: string
  initialValues: StudentFormValues
  loadError: string | null
}) {
  const form = useStudentForm({
    mode: 'create',
    prospectiveStudentId,
    initialValues,
  })
  const enrolling = Boolean(prospectiveStudentId)

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-white shadow-md shadow-[#253CA1]/25">
                <UserPlus className="size-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <Link
                  to={enrolling ? '/prospective-students' : '/students'}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#253CA1]"
                >
                  <ArrowLeft className="size-3.5" />
                  {enrolling ? 'Prospective Students' : 'Students'}
                </Link>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {enrolling ? 'Enroll Student' : 'Add New Student'}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  {enrolling
                    ? 'Lead details are already filled in. Confirm enrollment, then save. They stay inactive until a payment installment is approved.'
                    : 'Who they are, then enrollment, then how to reach them. Fields with a star are required.'}
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

        {loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        <StudentForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
        />
      </div>
    </AdminShell>
  )
}
