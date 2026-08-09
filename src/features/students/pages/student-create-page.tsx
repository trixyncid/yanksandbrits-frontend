import { Link, useSearch } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { mapGenderToApi } from '../../../shared/api/choices'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { fetchProspectiveStudent } from '../../prospective-students/api/prospective-students-api'
import {
  emptyStudentFormValues,
} from '../api/students-api'
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

        if (prospect.status !== 'prediction_test') {
          setLoadError(
            'Only pre-test prospective students can be enrolled as students.',
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
          status: 'active',
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
      <AdminShell>
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          <p className="text-sm text-slate-500">
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

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to={prospectiveStudentId ? '/prospective-students' : '/students'}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              {prospectiveStudentId ? 'Prospective Students' : 'Students'}
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {prospectiveStudentId ? 'Enroll Student' : 'Add New Student'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {prospectiveStudentId
                ? 'Complete enrollment details for this pre-test lead. Saving will mark them as enrolled.'
                : 'Create a student profile with personal, contact, and enrollment details.'}
            </p>
            {loadError ? (
              <p className="mt-2 text-sm text-rose-500">{loadError}</p>
            ) : null}
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
