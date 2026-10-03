import { Link } from '@tanstack/react-router'
import { useMemo, type FormEvent } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Input } from '../../../shared/components/ui/input'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import {
  formatCurrencyAmount,
  parseCurrencyValue,
} from '../../../shared/lib/currency'
import { Can } from '../../auth/components/can'
import { useLocksPaymentStatus } from '../../auth/hooks/use-permissions'
import { useProspectiveStudentsQuery } from '../../prospective-students/hooks/use-prospective-students-query'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import { useLinkedPredictionTestQuery } from '../hooks/use-linked-prediction-test-query'
import type {
  StudentPaymentFormErrors,
  StudentPaymentFormValues,
  StudentPaymentListItem,
  StudentPaymentTermFormValues,
} from '../types/student-payment'
import {
  Field,
  PaymentCollectionSummary,
  StudentPaymentTermsFields,
} from './student-payment-terms-fields'

type StudentPaymentFormProps = {
  mode: 'create' | 'edit'
  values: StudentPaymentFormValues
  errors: StudentPaymentFormErrors
  isSubmitting: boolean
  lockStudent?: boolean
  lockProspectiveStudent?: boolean
  payment?: StudentPaymentListItem
  onChange: <K extends keyof StudentPaymentFormValues>(
    field: K,
    value: StudentPaymentFormValues[K],
  ) => void
  onTermChange: (
    key: string,
    patch: Partial<StudentPaymentTermFormValues>,
  ) => void
  onPersistTerm?: (
    key: string,
    patch: Partial<StudentPaymentTermFormValues>,
  ) => Promise<StudentPaymentListItem | null>
  onPersistNewTerm?: (
    initial?: Partial<StudentPaymentTermFormValues>,
  ) => Promise<{
    payment: StudentPaymentListItem
    termKey: string
    termId: string
  } | null>
  onAddTerm: (initial?: Partial<StudentPaymentTermFormValues>) => void
  onRemoveTerm: (key: string) => void
  onProofUploaded?: (payment: StudentPaymentListItem) => void
  onSubmit: () => void | Promise<StudentPaymentListItem | null | void>
  onCancel: () => void
  onDelete?: () => void
}

export function StudentPaymentForm({
  mode,
  values,
  errors,
  isSubmitting,
  lockStudent = false,
  lockProspectiveStudent = false,
  payment,
  onChange,
  onTermChange,
  onPersistTerm,
  onPersistNewTerm,
  onAddTerm,
  onRemoveTerm,
  onProofUploaded,
  onSubmit,
  onCancel,
  onDelete,
}: StudentPaymentFormProps) {
  const studentsQuery = useStudentsQuery(
    mode === 'edit' ? {} : { status: 'all' },
  )
  const prospectsQuery = useProspectiveStudentsQuery({
    statuses: ['consult', 'prediction_test'],
  })
  const linkedPredictionQuery = useLinkedPredictionTestQuery({
    studentId: values.studentId,
    prospectiveStudentId: values.prospectiveStudentId,
    fullAmount: values.fullAmount,
    paymentId: payment?.id,
  })
  const students = studentsQuery.data?.data ?? []
  const studentOptions = useMemo(
    () =>
      students.map((option) => ({
        value: option.id,
        label: `${option.pin} | ${option.fullName}`,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    [students],
  )
  const prospectOptions = useMemo(
    () =>
      (prospectsQuery.data?.data ?? [])
        .filter((prospect) => !prospect.isStudent)
        .map((prospect) => ({
          value: prospect.id,
          label: prospect.fullName,
          keywords: `${prospect.fullName} ${prospect.email} ${prospect.srNumber}`,
        })),
    [prospectsQuery.data?.data],
  )
  const lockTransactionStatus = useLocksPaymentStatus()
  const selectedStudent = students.find(
    (student) => student.id === values.studentId,
  )
  const selectedProspect = (prospectsQuery.data?.data ?? []).find(
    (prospect) => prospect.id === values.prospectiveStudentId,
  )
  const defaultBranchId =
    selectedStudent?.branchId ||
    selectedProspect?.branchId ||
    payment?.terms.find((term) => term.branchId)?.branchId ||
    ''

  const plannedAmount = parseCurrencyValue(values.fullAmount)
  const linkedPredictionTestAmount =
    linkedPredictionQuery.data?.linkedPredictionTestAmount ??
    payment?.linkedPredictionTestAmount ??
    0
  const commissionBaseAmount =
    linkedPredictionQuery.data?.commissionBaseAmount ??
    plannedAmount + linkedPredictionTestAmount
  const linkedPredictionTests =
    linkedPredictionQuery.data?.linkedPredictionTests ??
    payment?.linkedPredictionTests ??
    []
  const predictionClaimedElsewhere =
    linkedPredictionQuery.data?.predictionClaimedElsewhere ??
    payment?.predictionClaimedElsewhere ??
    false
  const predictionFoldedIntoCommission =
    linkedPredictionQuery.data?.predictionFoldedIntoCommission ??
    payment?.predictionFoldedIntoCommission ??
    false
  const hasOwner = Boolean(values.studentId || values.prospectiveStudentId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await onSubmit()
    if (result) {
      onProofUploaded?.(result)
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {mode === 'edit' ? 'Plan settings' : 'Payment plan'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'edit'
              ? 'Update the plan title and planned amount. Collection progress updates as you edit installments.'
              : 'Set the planned amount, then add one or more installments against it.'}
          </p>
        </div>

        {mode === 'edit' && payment ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {payment.studentId ? 'Student' : 'Prospective student'}
            </p>
            {payment.studentId ? (
              <Link
                to="/students/$studentId"
                params={{ studentId: payment.studentId }}
                className="mt-1 inline-flex text-sm font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
              >
                {payment.studentPin
                  ? `${payment.studentPin} · ${payment.studentName}`
                  : payment.studentName}
              </Link>
            ) : payment.prospectiveStudentId ? (
              <Link
                to="/prospective-students/$prospectiveStudentId/edit"
                params={{
                  prospectiveStudentId: payment.prospectiveStudentId,
                }}
                className="mt-1 inline-flex text-sm font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
              >
                {payment.studentName}
              </Link>
            ) : (
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {payment.studentName}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              The person on a saved plan cannot be changed.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Student"
              htmlFor="studentId"
              error={errors.studentId}
              hint={
                lockStudent
                  ? 'Student is fixed from the student profile.'
                  : values.prospectiveStudentId
                    ? 'Clear the prospective student to select an enrolled student.'
                    : 'Use for an already enrolled student.'
              }
            >
              <SearchableSelect
                id="studentId"
                value={values.studentId}
                options={studentOptions}
                onChange={(nextStudentId) => {
                  onChange('studentId', nextStudentId)
                  if (nextStudentId) {
                    onChange('prospectiveStudentId', '')
                  }
                }}
                placeholder="Select student..."
                searchPlaceholder="Search students..."
                emptyMessage="No students found"
                disabled={
                  studentsQuery.isLoading ||
                  lockStudent ||
                  Boolean(values.prospectiveStudentId) ||
                  (lockProspectiveStudent && !values.studentId)
                }
                clearable={!lockStudent}
              />
            </Field>

            <Field
              label="Prospective student"
              htmlFor="prospectiveStudentId"
              error={errors.prospectiveStudentId}
              hint={
                lockProspectiveStudent
                  ? 'Prospect is fixed from the prospective student list.'
                  : values.studentId
                    ? 'Clear the student to select a prospective student.'
                    : 'Use for a Consult or Pre-Test lead before enrollment.'
              }
            >
              <SearchableSelect
                id="prospectiveStudentId"
                value={values.prospectiveStudentId}
                options={prospectOptions}
                onChange={(nextProspectId) => {
                  onChange('prospectiveStudentId', nextProspectId)
                  if (nextProspectId) {
                    onChange('studentId', '')
                  }
                }}
                placeholder="Select prospective student..."
                searchPlaceholder="Search prospects..."
                emptyMessage="No Consult or Pre-Test prospects found"
                disabled={
                  prospectsQuery.isLoading ||
                  lockProspectiveStudent ||
                  Boolean(values.studentId) ||
                  (lockStudent && !values.prospectiveStudentId)
                }
                clearable={!lockProspectiveStudent}
              />
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="Course Fee - SAT Intensive"
            />
          </Field>

          <Field
            label="Planned amount"
            htmlFor="fullAmount"
            error={errors.fullAmount}
            hint="Course fee for this plan. Matched pretest is added separately for commission."
          >
            <CurrencyInput
              id="fullAmount"
              value={values.fullAmount}
              onValueChange={(digits) => onChange('fullAmount', digits)}
              placeholder="0"
            />
          </Field>
        </div>

        <LinkedPredictionPlanBlock
          plannedAmount={plannedAmount}
          linkedAmount={linkedPredictionTestAmount}
          commissionBaseAmount={commissionBaseAmount}
          linkedTests={linkedPredictionTests}
          isLoading={linkedPredictionQuery.isFetching}
          hasOwner={hasOwner}
          claimedElsewhere={predictionClaimedElsewhere}
          foldedIntoCommission={predictionFoldedIntoCommission}
        />
      </section>

      <PaymentCollectionSummary
        plannedAmount={values.fullAmount}
        terms={values.terms}
        linkedPredictionAmount={linkedPredictionTestAmount}
      />

      <StudentPaymentTermsFields
        terms={values.terms}
        errors={errors}
        lockStatus={lockTransactionStatus}
        savedTerms={payment?.terms}
        plannedAmount={values.fullAmount}
        paymentId={payment?.id}
        defaultBranchId={defaultBranchId}
        onAdd={onAddTerm}
        onRemove={onRemoveTerm}
        onChange={onTermChange}
        onPersistTerm={onPersistTerm}
        onPersistNewTerm={onPersistNewTerm}
        onProofUploaded={onProofUploaded}
      />

      <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div>
          {mode === 'edit' && onDelete ? (
            <Can module="studentPayments" action="delete">
              <Button
                type="button"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete payment plan
              </Button>
            </Can>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'create'
                ? 'Saving...'
                : 'Saving changes...'
              : mode === 'create'
                ? 'Create payment plan'
                : 'Save changes'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function LinkedPredictionPlanBlock({
  plannedAmount,
  linkedAmount,
  commissionBaseAmount,
  linkedTests,
  isLoading,
  hasOwner,
  claimedElsewhere,
  foldedIntoCommission,
}: {
  plannedAmount: number
  linkedAmount: number
  commissionBaseAmount: number
  linkedTests: StudentPaymentListItem['linkedPredictionTests']
  isLoading: boolean
  hasOwner: boolean
  claimedElsewhere: boolean
  foldedIntoCommission: boolean
}) {
  if (!hasOwner) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <p className="text-sm text-slate-500">
          Select a student or prospective student to check for a matching
          prediction-test payment.
        </p>
      </div>
    )
  }

  if (isLoading && linkedAmount <= 0 && !claimedElsewhere) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <p className="text-sm text-slate-500">Looking up matching pretest…</p>
      </div>
    )
  }

  if (claimedElsewhere && linkedAmount <= 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <p className="text-sm text-slate-500">
          A matching pretest exists, but another payment plan already claims it
          for marketer commission. This plan uses the course fee only.
        </p>
      </div>
    )
  }

  if (linkedAmount <= 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <p className="text-sm text-slate-500">
          No approved prediction-test payment matches this person.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#C8D4F5] bg-[#F5F8FF]">
      <div className="border-b border-[#D7E4F6] px-4 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-[#253CA1] uppercase">
          Plan composition
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {foldedIntoCommission
            ? 'Matched pretest is included in this plan’s commission base (first completed plan for this person).'
            : 'Matched pretest will join commission on the first completed plan for this person — only once.'}
        </p>
      </div>
      <dl className="divide-y divide-[#E8F0FA]">
        <CompositionRow
          label="Course fee (planned)"
          value={formatCurrencyAmount(plannedAmount)}
        />
        <CompositionRow
          label="Linked prediction test"
          value={formatCurrencyAmount(linkedAmount)}
          hint={
            linkedTests.length > 1
              ? `${linkedTests.length} approved pretest payments`
              : 'Matched via GRN / SR number'
          }
          emphasize
        />
        <CompositionRow
          label="Commission base"
          value={formatCurrencyAmount(commissionBaseAmount)}
          hint="Course fee + pretest"
          strong
        />
      </dl>
    </div>
  )
}

function CompositionRow({
  label,
  value,
  hint,
  emphasize = false,
  strong = false,
}: {
  label: string
  value: string
  hint?: string
  emphasize?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <dt
          className={
            emphasize
              ? 'text-sm font-semibold text-[#1B2A5A]'
              : 'text-sm text-slate-600'
          }
        >
          {label}
        </dt>
        {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
      </div>
      <dd
        className={
          strong
            ? 'shrink-0 text-base font-bold tabular-nums text-slate-900'
            : emphasize
              ? 'shrink-0 text-sm font-bold tabular-nums text-[#1B2A5A]'
              : 'shrink-0 text-sm font-semibold tabular-nums text-slate-800'
        }
      >
        {value}
      </dd>
    </div>
  )
}
