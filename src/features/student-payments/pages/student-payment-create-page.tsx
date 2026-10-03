import { useSearch } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'

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

  const backLabel = prefilledStudentId
    ? 'Student detail'
    : prefilledProspectiveStudentId
      ? 'Prospective Students'
      : 'Payments'

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1">
          <button
            type="button"
            onClick={form.cancel}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </button>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Record Payment Plan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {prefilledProspectiveStudentId
              ? 'Create a payment plan for this Consult or Pre-Test prospect. Enroll becomes available after an approved installment.'
              : 'Create a planned amount with one or more installments.'}
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
            onRemoveTerm={form.removeTerm}
            onSubmit={form.submit}
            onCancel={form.cancel}
          />
        </div>
      </div>
    </AdminShell>
  )
}
