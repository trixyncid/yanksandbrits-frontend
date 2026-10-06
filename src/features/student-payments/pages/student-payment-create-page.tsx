import { Link, useSearch } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { createEmptyStudentPaymentFormValues } from '../api/student-payments-api'
import { StudentPaymentForm } from '../components/student-payment-form'
import { useStudentPaymentForm } from '../hooks/use-student-payment-form'

export default function StudentPaymentCreatePage() {
  const {
    studentId: prefilledStudentId,
    prospectiveStudentId: prefilledProspectiveStudentId,
  } = useSearch({ strict: false }) as {
    studentId?: string
    prospectiveStudentId?: string
  }

  const initialValues = useMemo(
    () => ({
      ...createEmptyStudentPaymentFormValues(),
      studentId: prefilledStudentId ?? '',
      prospectiveStudentId: prefilledProspectiveStudentId ?? '',
    }),
    [prefilledStudentId, prefilledProspectiveStudentId],
  )

  const form = useStudentPaymentForm({
    mode: 'create',
    initialValues,
    returnToStudentId: prefilledStudentId,
    returnToProspectiveStudents: Boolean(prefilledProspectiveStudentId),
  })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <BackLink
              studentId={prefilledStudentId}
              prospectiveStudentId={prefilledProspectiveStudentId}
            />
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Add Payment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {prefilledProspectiveStudentId
                ? 'Set the fee and schedule for this Consult or Pre-Test prospect. You can enroll them while the payment is still pending.'
                : 'Choose who it is for, set the fee, then record the installments.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <StudentPaymentForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          lockStudent={Boolean(prefilledStudentId)}
          lockProspectiveStudent={Boolean(prefilledProspectiveStudentId)}
          onChange={form.updateField}
          onTermChange={form.updateTerm}
          onAddTerm={form.addTerm}
          onReplaceTerms={form.replaceTerms}
          onRemoveTerm={form.removeTerm}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onPretestCredit={form.setPretestCredit}
        />
      </div>
    </AdminShell>
  )
}

function BackLink({
  studentId,
  prospectiveStudentId,
}: {
  studentId?: string
  prospectiveStudentId?: string
}) {
  const className =
    'inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]'

  if (studentId) {
    return (
      <Link
        to="/students/$studentId"
        params={{ studentId }}
        className={className}
      >
        <ArrowLeft className="size-4" />
        Student detail
      </Link>
    )
  }

  if (prospectiveStudentId) {
    return (
      <Link to="/prospective-students" className={className}>
        <ArrowLeft className="size-4" />
        Prospective Students
      </Link>
    )
  }

  return (
    <Link to="/student-payments" className={className}>
      <ArrowLeft className="size-4" />
      Payments
    </Link>
  )
}
