import { CircleDollarSign, Layers, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

import {
  ChoiceTile,
  FormSectionCard,
} from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Input } from '../../../shared/components/ui/input'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import {
  formatCurrencyAmount,
  parseCurrencyValue,
} from '../../../shared/lib/currency'
import { Can } from '../../auth/components/can'
import {
  useCanApproveInstallmentPlan,
  useLocksPaymentStatus,
} from '../../auth/hooks/use-permissions'
import { useProspectiveStudentsQuery } from '../../prospective-students/hooks/use-prospective-students-query'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import { useLinkedPredictionTestQuery } from '../hooks/use-linked-prediction-test-query'
import { planAmountDue } from '../lib/payment-display'
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
  onAddTerm: (
    initial?: Partial<StudentPaymentTermFormValues>,
  ) => void | string
  onReplaceTerms: (terms: StudentPaymentTermFormValues[]) => void
  onRemoveTerm: (key: string) => void
  onProofUploaded?: (payment: StudentPaymentListItem) => void
  onSubmit: () => void | Promise<StudentPaymentListItem | null | void>
  onCancel: () => void
  onDelete?: () => void
  onPretestCredit?: (amount: number) => void
  onApproveInstallmentPlan?: () => void
  isApprovingInstallmentPlan?: boolean
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
  onAddTerm,
  onReplaceTerms,
  onRemoveTerm,
  onProofUploaded,
  onSubmit,
  onCancel,
  onDelete,
  onPretestCredit,
  onApproveInstallmentPlan,
  isApprovingInstallmentPlan = false,
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
  const canApproveInstallmentPlan = useCanApproveInstallmentPlan()
  const savedTermCount = payment?.terms.length ?? 0
  const twoPaymentPlan = values.installmentPlan === 'two'
  const planAlreadyApproved = Boolean(payment?.installmentPlanApproved)
  const needsPlanApproval = twoPaymentPlan && !planAlreadyApproved
  const approverWillApproveOnSave =
    needsPlanApproval &&
    canApproveInstallmentPlan &&
    (mode === 'create' || savedTermCount < 2)
  const submitForApproval = needsPlanApproval && !canApproveInstallmentPlan
  const submitLabel = isSubmitting
    ? mode === 'create'
      ? 'Saving...'
      : 'Saving changes...'
    : submitForApproval
      ? 'Submit for approval'
      : approverWillApproveOnSave
        ? 'Save and approve'
        : mode === 'create'
          ? 'Create payment plan'
          : 'Save changes'
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
  const predictionClaimedElsewhere =
    linkedPredictionQuery.data?.predictionClaimedElsewhere ??
    payment?.predictionClaimedElsewhere ??
    false
  const predictionFoldedIntoCommission =
    linkedPredictionQuery.data?.predictionFoldedIntoCommission ??
    payment?.predictionFoldedIntoCommission ??
    false
  const linkedTests =
    linkedPredictionQuery.data?.linkedPredictionTests ??
    payment?.linkedPredictionTests ??
    []
  const hasOwner = Boolean(values.studentId || values.prospectiveStudentId)
  const [ownerMode, setOwnerMode] = useState<'student' | 'prospect'>(() =>
    values.prospectiveStudentId || (lockProspectiveStudent && !lockStudent)
      ? 'prospect'
      : 'student',
  )
  const showOwnerSwitcher =
    mode === 'create' && !lockStudent && !lockProspectiveStudent
  const discountAmount = parseCurrencyValue(values.discountAmount)
  const appliedPretest = predictionClaimedElsewhere
    ? 0
    : linkedPredictionTestAmount
  const approvedPretest = predictionClaimedElsewhere
    ? 0
    : linkedTests.reduce(
        (sum, test) =>
          test.status === '2_AP' || test.status === 'approved'
            ? sum + test.amount
            : sum,
        0,
      )
  const commissionBase = Math.max(0, plannedAmount - discountAmount) + approvedPretest
  const due = planAmountDue(plannedAmount, discountAmount, appliedPretest)

  useEffect(() => {
    onPretestCredit?.(appliedPretest)
  }, [appliedPretest, onPretestCredit])

  useEffect(() => {
    if (values.studentId) setOwnerMode('student')
    else if (values.prospectiveStudentId) setOwnerMode('prospect')
  }, [values.prospectiveStudentId, values.studentId])

  function selectOwnerMode(next: 'student' | 'prospect') {
    setOwnerMode(next)
    if (next === 'student') onChange('prospectiveStudentId', '')
    else onChange('studentId', '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await onSubmit()
    if (result) {
      onProofUploaded?.(result)
    }
  }

  const ownerLabel =
    ownerMode === 'prospect' || lockProspectiveStudent
      ? selectedProspect?.fullName
      : selectedStudent
        ? `${selectedStudent.pin} · ${selectedStudent.fullName}`
        : ''

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      {mode === 'create' ? (
        <FormSectionCard
          icon={UserRound}
          title="Who is this for?"
          description="Pick one enrolled student or one Consult / Pre-Test prospect."
        >
          {showOwnerSwitcher ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <ChoiceTile
                name="payment-owner"
                title="Enrolled student"
                description="Already has a student record."
                selected={ownerMode === 'student'}
                onSelect={() => selectOwnerMode('student')}
              />
              <ChoiceTile
                name="payment-owner"
                title="Prospective student"
                description="Consult or Pre-Test, not enrolled yet."
                selected={ownerMode === 'prospect'}
                onSelect={() => selectOwnerMode('prospect')}
              />
            </div>
          ) : null}

          {ownerMode === 'student' || lockStudent ? (
            <Field
              label="Student"
              htmlFor="studentId"
              error={errors.studentId ?? errors.prospectiveStudentId}
              required
              hint={
                lockStudent
                  ? 'Filled in from the student profile.'
                  : 'Search by PIN or name.'
              }
            >
              <SearchableSelect
                id="studentId"
                value={values.studentId}
                options={studentOptions}
                onChange={(nextStudentId) => {
                  onChange('studentId', nextStudentId)
                  if (nextStudentId) onChange('prospectiveStudentId', '')
                }}
                placeholder="Select student..."
                searchPlaceholder="Search students..."
                emptyMessage="No students found"
                disabled={studentsQuery.isLoading || lockStudent}
                clearable={!lockStudent}
              />
            </Field>
          ) : (
            <Field
              label="Prospective student"
              htmlFor="prospectiveStudentId"
              error={errors.prospectiveStudentId ?? errors.studentId}
              required
              hint={
                lockProspectiveStudent
                  ? 'Filled in from the prospective student list.'
                  : 'Consult and Pre-Test leads only.'
              }
            >
              <SearchableSelect
                id="prospectiveStudentId"
                value={values.prospectiveStudentId}
                options={prospectOptions}
                onChange={(nextProspectId) => {
                  onChange('prospectiveStudentId', nextProspectId)
                  if (nextProspectId) onChange('studentId', '')
                }}
                placeholder="Select prospective student..."
                searchPlaceholder="Search prospects..."
                emptyMessage="No Consult or Pre-Test prospects found"
                disabled={prospectsQuery.isLoading || lockProspectiveStudent}
                clearable={!lockProspectiveStudent}
              />
            </Field>
          )}

          {ownerLabel ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#C8D4F5]/90 bg-[#F5F8FF] px-3 py-2.5">
              <span className="text-sm font-semibold text-slate-900">
                {ownerLabel}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#253CA1] ring-1 ring-[#C8D4F5]">
                {ownerMode === 'prospect' || lockProspectiveStudent
                  ? 'Prospective student'
                  : 'Enrolled student'}
              </span>
            </div>
          ) : null}
        </FormSectionCard>
      ) : null}

      <FormSectionCard
        icon={CircleDollarSign}
        title="Fee"
        description="Discount and a one-time pretest credit come off the course fee."
        delayClassName="delay-75"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" error={errors.title} required>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="Course Fee - SAT Intensive"
            />
          </Field>

          <Field
            label="Course fee"
            htmlFor="fullAmount"
            error={errors.fullAmount}
            required
            hint="Price before discount and pretest credit."
          >
            <CurrencyInput
              id="fullAmount"
              value={values.fullAmount}
              onValueChange={(digits) => onChange('fullAmount', digits)}
              placeholder="0"
            />
          </Field>
        </div>

        <PlanBalanceCard
          courseFee={plannedAmount}
          discountAmount={values.discountAmount}
          discountError={errors.discountAmount}
          pretestCredit={appliedPretest}
          amountDue={due}
          isLoading={linkedPredictionQuery.isFetching}
          hasOwner={hasOwner}
          claimedElsewhere={predictionClaimedElsewhere}
          foldedIntoCommission={predictionFoldedIntoCommission}
          awaitingFinance={
            !predictionClaimedElsewhere &&
            linkedTests.some(
              (test) => test.status === '1_PD' || test.status === 'pending',
            )
          }
          commissionBase={commissionBase}
          onDiscountChange={(digits) => onChange('discountAmount', digits)}
        />
      </FormSectionCard>

      <FormSectionCard
        icon={Layers}
        title="Installments"
        description="Pay in full, or split the balance into 2 payments. A 2-payment plan needs approval before those installments can be approved."
        delayClassName="delay-100"
      >
        {plannedAmount > 0 || values.terms.length > 0 ? (
          <PaymentCollectionSummary
            plannedAmount={String(due)}
            courseFee={plannedAmount}
            terms={values.terms}
          />
        ) : null}

        <StudentPaymentTermsFields
          terms={values.terms}
          errors={errors}
          lockStatus={lockTransactionStatus}
          savedTerms={payment?.terms}
          plannedAmount={String(due)}
          zeroIsCapped={plannedAmount > 0}
          paymentId={payment?.id}
          defaultBranchId={defaultBranchId}
          installmentPlan={values.installmentPlan}
          onInstallmentPlanChange={(plan) => onChange('installmentPlan', plan)}
          installmentPlanApproved={Boolean(payment?.installmentPlanApproved)}
          installmentPlanApprovedBy={payment?.installmentPlanApprovedBy ?? ''}
          canApproveInstallmentPlan={canApproveInstallmentPlan}
          isApprovingInstallmentPlan={isApprovingInstallmentPlan}
          savedTermCount={payment?.terms.length ?? 0}
          onApproveInstallmentPlan={onApproveInstallmentPlan}
          onAdd={onAddTerm}
          onReplace={onReplaceTerms}
          onRemove={onRemoveTerm}
          onChange={onTermChange}
          onProofUploaded={onProofUploaded}
        />
      </FormSectionCard>

      <div className="sticky bottom-2 z-10 animate-in fade-in slide-in-from-bottom-2 delay-150">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:px-4">
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
                  Delete
                </Button>
              </Can>
            ) : (
              <p className="hidden text-xs text-slate-400 sm:block">
                {hasOwner
                  ? 'Fee and installments save together.'
                  : 'Select a student to continue.'}
              </p>
            )}
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
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function PlanBalanceCard({
  courseFee,
  discountAmount,
  discountError,
  pretestCredit,
  amountDue,
  isLoading,
  hasOwner,
  claimedElsewhere,
  foldedIntoCommission,
  awaitingFinance,
  commissionBase,
  onDiscountChange,
}: {
  courseFee: number
  discountAmount: string
  discountError?: string
  pretestCredit: number
  amountDue: number
  isLoading: boolean
  hasOwner: boolean
  claimedElsewhere: boolean
  foldedIntoCommission: boolean
  awaitingFinance: boolean
  commissionBase: number
  onDiscountChange: (digits: string) => void
}) {
  const pretestNote = !hasOwner
    ? 'Choose a student to check for a pretest payment.'
    : isLoading && pretestCredit <= 0 && !claimedElsewhere
      ? 'Looking up pretest payments…'
      : claimedElsewhere
        ? 'Already applied on another plan. A pretest payment can only be used once.'
        : pretestCredit > 0
          ? awaitingFinance
            ? `Included on this plan before finance approves it. Commission base is ${formatCurrencyAmount(commissionBase)} until then.`
            : foldedIntoCommission
              ? `Applied once on this plan. Commission base is ${formatCurrencyAmount(commissionBase)}.`
              : `Will apply to this plan once. Commission base is ${formatCurrencyAmount(commissionBase)} until the pretest is approved.`
          : 'No pretest payment for this person.'

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D7E4F6] bg-[linear-gradient(180deg,#F5F8FF_0%,#FFFFFF_70%)]">
      <div className="space-y-3 px-4 py-4">
        <BalanceRow
          label="Course fee"
          value={formatCurrencyAmount(courseFee)}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Discount</p>
            <p className="text-xs text-slate-400">Optional. Cannot exceed the course fee.</p>
          </div>
          <div className="w-full sm:w-52">
            <CurrencyInput
              id="discountAmount"
              value={discountAmount}
              onValueChange={onDiscountChange}
              placeholder="0"
              aria-invalid={Boolean(discountError)}
            />
            {discountError ? (
              <p className="mt-1 text-xs text-rose-500">{discountError}</p>
            ) : null}
          </div>
        </div>
        <BalanceRow
          label="Pretest payment"
          value={
            pretestCredit > 0
              ? `− ${formatCurrencyAmount(pretestCredit)}`
              : formatCurrencyAmount(0)
          }
          hint={pretestNote}
          emphasize={pretestCredit > 0}
        />
      </div>
      <div className="border-t border-[#D7E4F6] bg-white px-4 py-4">
        <BalanceRow
          label="Amount due"
          value={formatCurrencyAmount(amountDue)}
          strong
        />
      </div>
    </div>
  )
}

function BalanceRow({
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
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p
          className={
            emphasize || strong
              ? 'text-sm font-semibold text-[#1B2A5A]'
              : 'text-sm text-slate-600'
          }
        >
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
      </div>
      <p
        className={
          strong
            ? 'shrink-0 text-base font-bold tabular-nums text-slate-900'
            : emphasize
              ? 'shrink-0 text-sm font-bold tabular-nums text-[#1B2A5A]'
              : 'shrink-0 text-sm font-semibold tabular-nums text-slate-800'
        }
      >
        {value}
      </p>
    </div>
  )
}
