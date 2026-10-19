import { useSearch } from '@tanstack/react-router'
import { TriangleAlert, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { mapGenderToApi } from '../../../shared/api/choices'
import { PageHeader } from '../../../shared/components/page'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { fetchProspectiveStudent } from '../../prospective-students/api/prospective-students-api'
import { emptyStudentFormValues } from '../api/students-api'
import { StudentForm } from '../components/student-form'
import { useEnrollableProspectsQuery } from '../hooks/use-enrollable-prospects-query'
import { useStudentForm } from '../hooks/use-student-form'
import type { StudentFormValues } from '../types/student'

function todayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Student details taken from a prospective student who can enroll.
 * Throws a readable message when they are already enrolled or have not paid.
 */
async function loadProspectValues(
  prospectiveStudentId: string,
): Promise<StudentFormValues> {
  const prospect = await fetchProspectiveStudent(prospectiveStudentId)

  if (prospect.isStudent || prospect.status === 'enrolled') {
    throw new Error('This prospective student is already enrolled.')
  }

  if (!prospect.canEnroll) {
    throw new Error(
      'Enroll requires a student payment. A pending plan is enough; the student stays inactive until an installment is approved.',
    )
  }

  return {
    ...emptyStudentFormValues,
    fullName: prospect.fullName,
    email: prospect.email,
    gender: mapGenderToApi(prospect.gender ?? ''),
    address: prospect.address,
    age: prospect.age == null ? '' : String(prospect.age),
    mobilePhone: prospect.phone,
    enrollmentDate: todayDateString(),
    grn: prospect.srNumber,
    counsellorId: prospect.marketingId ?? '',
    branchId: prospect.branchId ?? '',
    status: 'inactive',
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error && !('isAxiosError' in error)
    ? error.message
    : getApiErrorMessage(error)
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

    void loadProspectValues(prospectiveStudentId)
      .then((values) => {
        if (!cancelled) {
          setInitialValues(values)
        }
      })
      .catch((error) => {
        if (cancelled) {
          return
        }
        setLoadError(errorMessage(error))
        setInitialValues(emptyStudentFormValues)
      })

    return () => {
      cancelled = true
    }
  }, [prospectiveStudentId])

  if (initialValues == null) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div
          className="mx-auto flex max-w-6xl flex-col items-center rounded-[1.75rem] bg-white px-6 py-20 text-center"
          aria-busy="true"
        >
          <span className="inline-flex size-14 animate-pulse items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <UserPlus className="size-6" strokeWidth={1.7} />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading the prospective student’s details...
          </p>
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentCreateForm
      prospectiveStudentId={loadError ? undefined : prospectiveStudentId}
      fromProspectPage={Boolean(prospectiveStudentId)}
      initialValues={initialValues}
      loadError={loadError}
    />
  )
}

function StudentCreateForm({
  prospectiveStudentId,
  fromProspectPage,
  initialValues,
  loadError,
}: {
  prospectiveStudentId?: string
  fromProspectPage: boolean
  initialValues: StudentFormValues
  loadError: string | null
}) {
  const form = useStudentForm({
    mode: 'create',
    prospectiveStudentId,
    initialValues,
  })
  const prospectsQuery = useEnrollableProspectsQuery()
  const [isLoadingProspect, setIsLoadingProspect] = useState(false)

  const prospectOptions = useMemo(
    () =>
      (prospectsQuery.data ?? []).map((prospect) => ({
        value: prospect.id,
        label: prospect.srNumber
          ? `${prospect.fullName} · ${prospect.srNumber}`
          : prospect.fullName,
        keywords: [
          prospect.fullName,
          prospect.srNumber,
          prospect.phone,
          prospect.counsellorName,
          prospect.branchName,
        ].join(' '),
      })),
    [prospectsQuery.data],
  )

  async function handleSelectProspect(id: string) {
    if (!id || id === form.prospectiveStudentId) {
      return
    }
    setIsLoadingProspect(true)
    try {
      form.selectProspect(id, await loadProspectValues(id))
    } catch (error) {
      notify('error', {
        title: 'Unable to load prospective student',
        description: errorMessage(error),
      })
    } finally {
      setIsLoadingProspect(false)
    }
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo={fromProspectPage ? '/prospective-students' : '/students'}
          backLabel={fromProspectPage ? 'Prospective Students' : 'Students'}
          title={fromProspectPage ? 'Enroll student' : 'Add student'}
          description={
            form.prospectiveStudentId
              ? 'Details come from the prospective student. Check them, fill in anything missing, then save. They stay inactive until a payment installment is approved.'
              : 'Choose a prospective student who has made a payment. Their details fill in automatically.'
          }
          icon={UserPlus}
          theme="harbor"
          pattern="waves"
        />

        {loadError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-3xl bg-rose-50 px-4 py-3.5 text-sm text-rose-700"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">
                We couldn’t use that prospective student
              </p>
              <p className="mt-0.5 text-rose-600">{loadError}</p>
            </div>
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
          prospectPicker={{
            value: form.prospectiveStudentId,
            options: prospectOptions,
            loading: prospectsQuery.isLoading || isLoadingProspect,
            onChange: (id) => void handleSelectProspect(id),
          }}
        />
      </div>
    </AdminShell>
  )
}
