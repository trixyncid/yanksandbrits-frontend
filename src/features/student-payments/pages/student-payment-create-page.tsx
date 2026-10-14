import { useSearch } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import { useMemo } from 'react'

import { PageHeader } from '../../../shared/components/page'
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

  const back = prefilledStudentId
    ? { to: `/students/${prefilledStudentId}`, label: 'Student detail' }
    : prefilledProspectiveStudentId
      ? { to: '/prospective-students', label: 'Prospective students' }
      : { to: '/student-payments', label: 'Student payments' }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo={back.to}
          backLabel={back.label}
          title="Add payment plan"
          description={
            prefilledProspectiveStudentId
              ? 'Set the fee and schedule for this Consult or Pre-Test prospect. You can enroll them while the payment is still pending.'
              : 'Choose who it is for, set the fee, then record the installments.'
          }
          icon={Wallet}
          theme="dusk"
          pattern="grid"
        />

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
