import {
  CircleDollarSign,
  Layers,
  Lock,
  ShieldCheck,
  UserCheck,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

import {
  ChoiceTile,
  FormSectionCard,
} from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Input } from '../../../shared/components/ui/input'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import {
  formatCurrencyAmount,
  parseCurrencyValue,
} from '../../../shared/lib/currency'
import {
  useAuthUser,
  useCanChangePaymentRecorder,
  useCanEditApprovedPayment,
  useIsMarketing,
  useLocksPaymentStatus,
  useModulePermissions,
} from '../../auth/hooks/use-permissions'
import { useProspectiveStudentsQuery } from '../../prospective-students/hooks/use-prospective-students-query'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import { useEducationCounsellorOptionsQuery } from '../../users/hooks/use-user-options'
import type { StudentListItem } from '../../students/types/student'
import { useLinkedPredictionTestQuery } from '../hooks/use-linked-prediction-test-query'
import { planAmountDue } from '../lib/payment-display'
import { cn } from '../../../shared/lib/cn'
import { DuskPanel } from './payment-ui'
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

const EMPTY_STUDENTS: StudentListItem[] = []

/** "Jane Doe (SR-012)", or just the name when there is no SR number yet. */
function prospectLabel(prospect: { fullName: string; srNumber: string }) {
  const sr = prospect.srNumber.trim()
  return sr ? `${prospect.fullName} (${sr})` : prospect.fullName
}

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
  const students = studentsQuery.data?.data ?? EMPTY_STUDENTS
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
          label: prospectLabel(prospect),
          keywords: `${prospect.fullName} ${prospect.email} ${prospect.srNumber}`,
        })),
    [prospectsQuery.data?.data],
  )
  const lockTransactionStatus = useLocksPaymentStatus()
  const canEditApprovedPayment = useCanEditApprovedPayment()
  const canChangeRecorder = useCanChangePaymentRecorder()
  const isMarketingUser = useIsMarketing()
  const authUser = useAuthUser()
  const counsellorsQuery = useEducationCounsellorOptionsQuery({
    enabled: canChangeRecorder,
  })
  // Fee fields lock for counsellors once any installment is approved.
  const feeLocked =
    !canEditApprovedPayment &&
    (payment?.terms ?? []).some((term) => term.status === 'approved')
  const { canDelete } = useModulePermissions('studentPayments')
  const submitLabel = mode === 'create' ? 'Create payment plan' : 'Save changes'
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

  // Follow the selected owner whenever it changes (including the first render).
  const ownerKey = `${values.studentId}|${values.prospectiveStudentId}`
  const [syncedOwnerKey, setSyncedOwnerKey] = useState<string | null>(null)
  if (syncedOwnerKey !== ownerKey) {
    setSyncedOwnerKey(ownerKey)
    if (values.studentId) setOwnerMode('student')
    else if (values.prospectiveStudentId) setOwnerMode('prospect')
  }

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
      ? selectedProspect && prospectLabel(selectedProspect)
      : selectedStudent
        ? `${selectedStudent.pin} · ${selectedStudent.fullName}`
        : ''

  const ownerIsProspect = ownerMode === 'prospect' || lockProspectiveStudent

  // Who recorded the payment. Mirrors StudentPaymentService: a counsellor or
  // branch manager is credited themselves, otherwise the student's counsellor.
  const ownerCounsellorId = values.studentId
    ? selectedStudent?.counsellorId ?? ''
    : selectedProspect?.marketingId ?? ''
  const ownerCounsellorName = values.studentId
    ? selectedStudent?.counsellor ?? ''
    : selectedProspect?.educationCounsellor ?? ''
  const defaultRecorderId =
    mode === 'edit'
      ? payment?.recordedById ?? ''
      : isMarketingUser
        ? String(authUser?.id ?? '')
        : ownerCounsellorId
  const recorderId =
    (canChangeRecorder ? values.recordedById : '') || defaultRecorderId
  const recorderOptions = (() => {
    const options = (counsellorsQuery.data ?? []).map((option) => ({
      value: option.id,
      label: `${option.pin} | ${option.fullName}`,
      keywords: `${option.pin} ${option.fullName} ${option.email}`,
    }))
    if (recorderId && !options.some((option) => option.value === recorderId)) {
      // Locked users don't load the list; show the name we already have.
      const name =
        recorderId === payment?.recordedById
          ? payment.recordedByName
          : recorderId === String(authUser?.id)
            ? authUser?.full_name ?? ''
            : ownerCounsellorName
      options.unshift({ value: recorderId, label: name || 'Unknown', keywords: name })
    }
    return options
  })()
  const recorderHint = canChangeRecorder
    ? "Defaults to the student's counsellor. Only Finance or a system admin can change this."
    : mode === 'create' && isMarketingUser
      ? 'Recorded as you. Only Finance or a system admin can change this.'
      : 'Only Finance or a system admin can change this.'

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
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
                    disabled={
                      prospectsQuery.isLoading || lockProspectiveStudent
                    }
                    clearable={!lockProspectiveStudent}
                  />
                </Field>
              )}

              {ownerLabel ? (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-canvas px-3.5 py-2.5">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-ink text-white">
                    <UserRound className="size-3.5" />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {ownerLabel}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
                    {ownerIsProspect
                      ? 'Prospective student'
                      : 'Enrolled student'}
                  </span>
                </div>
              ) : null}
            </FormSectionCard>
          ) : null}

          <FormSectionCard
            icon={UserCheck}
            title="Recorded by"
            description="The education counsellor or branch manager who brought in this payment."
          >
            <Field
              label="Education counsellor"
              htmlFor="recordedById"
              error={errors.recordedById}
              hint={recorderHint}
            >
              <SearchableSelect
                id="recordedById"
                value={recorderId}
                options={recorderOptions}
                onChange={(next) => onChange('recordedById', next)}
                placeholder={
                  hasOwner ? "Student's counsellor" : 'Pick the student first'
                }
                searchPlaceholder="Search counsellors..."
                emptyMessage="No education counsellors found"
                disabled={!canChangeRecorder || counsellorsQuery.isLoading}
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={CircleDollarSign}
            title="Fee"
            description="Discount and a one-time pretest credit come off the course fee."
            delayClassName="delay-75"
          >
            {feeLocked ? (
              <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 px-3.5 py-3 text-amber-900">
                <Lock className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm">
                  A payment on this plan has been approved, so the fee can no
                  longer be changed. Contact Finance if something needs
                  fixing.
                </p>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" htmlFor="title" error={errors.title} required>
                <Input
                  id="title"
                  value={values.title}
                  onChange={(event) => onChange('title', event.target.value)}
                  placeholder="Course Fee - SAT Intensive"
                  disabled={feeLocked}
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
                  disabled={feeLocked}
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
              discountLocked={feeLocked}
            />
          </FormSectionCard>

          <FormSectionCard
            icon={Layers}
            title="Installments"
            description="Pay in full, or split the balance into 2 payments. The two amounts can be different."
            delayClassName="delay-100"
          >
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
              onInstallmentPlanChange={(plan) =>
                onChange('installmentPlan', plan)
              }
              canEditApprovedPayment={canEditApprovedPayment}
              onAdd={onAddTerm}
              onReplace={onReplaceTerms}
              onRemove={onRemoveTerm}
              onChange={onTermChange}
              onProofUploaded={onProofUploaded}
            />
          </FormSectionCard>
        </div>

        <aside
          className={cn(
            'space-y-3 lg:sticky lg:top-4',
            mode === 'edit' && 'order-first lg:order-none',
          )}
        >
          <DuskPanel className="animate-in fade-in slide-in-from-bottom-2">
            <p className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
              Amount due
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
              {formatCurrencyAmount(due)}
            </p>
            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-white/70">Course fee</dt>
                <dd className="font-semibold tabular-nums">
                  {formatCurrencyAmount(plannedAmount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/70">Discount</dt>
                <dd className="font-semibold tabular-nums">
                  − {formatCurrencyAmount(Math.min(discountAmount, plannedAmount))}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/70">Pretest credit</dt>
                <dd className="font-semibold tabular-nums">
                  − {formatCurrencyAmount(appliedPretest)}
                </dd>
              </div>
            </dl>
            {plannedAmount > 0 || values.terms.length > 0 ? (
              <div className="mt-5 border-t border-white/15 pt-4">
                <PaymentCollectionSummary
                  plannedAmount={String(due)}
                  courseFee={plannedAmount}
                  terms={values.terms}
                />
              </div>
            ) : (
              <p className="mt-5 border-t border-white/15 pt-4 text-xs text-white/70">
                Enter a course fee to see how much is collected and still owed.
              </p>
            )}
          </DuskPanel>

          {feeLocked || lockTransactionStatus ? (
            <section className="animate-in fade-in slide-in-from-bottom-2 space-y-2 rounded-[1.75rem] bg-white p-5 delay-75">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-canvas">
                  <ShieldCheck className="size-4" />
                </span>
                Approvals
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {lockTransactionStatus ? (
                  <li>Finance marks installments as approved or void.</li>
                ) : null}
                {feeLocked ? (
                  <li>
                    Approved payments are read-only. Contact Finance to change
                    them.
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      <FormSaveBar
        mode={mode}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onDelete={
          mode === 'edit' && onDelete && !feeLocked && canDelete
            ? onDelete
            : undefined
        }
        deleteLabel="Delete payment plan"
        submitLabel={submitLabel}
        hint={
          hasOwner
            ? 'Fee and installments save together.'
            : 'Select a student to continue.'
        }
      />
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
  discountLocked = false,
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
  discountLocked?: boolean
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
    <div className="overflow-hidden rounded-3xl bg-canvas">
      <div className="space-y-3 px-4 py-4 sm:px-5">
        <BalanceRow
          label="Course fee"
          value={formatCurrencyAmount(courseFee)}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Discount</p>
            <p className="text-xs text-slate-500">
              Optional. Cannot exceed the course fee.
            </p>
          </div>
          <div className="w-full sm:w-52">
            <CurrencyInput
              id="discountAmount"
              value={discountAmount}
              onValueChange={onDiscountChange}
              disabled={discountLocked}
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
      <div className="m-1.5 rounded-[1.25rem] bg-ink px-4 py-3.5 text-white">
        <BalanceRow
          label="Amount due"
          hint="What the student pays across their installments."
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
            strong
              ? 'text-sm font-semibold text-white'
              : emphasize
                ? 'text-sm font-semibold text-brand-800'
                : 'text-sm text-slate-600'
          }
        >
          {label}
        </p>
        {hint ? (
          <p
            className={
              strong
                ? 'mt-0.5 text-xs text-white/65'
                : 'mt-0.5 text-xs text-slate-500'
            }
          >
            {hint}
          </p>
        ) : null}
      </div>
      <p
        className={
          strong
            ? 'shrink-0 text-lg font-bold tabular-nums text-white'
            : emphasize
              ? 'shrink-0 text-sm font-bold tabular-nums text-brand-800'
              : 'shrink-0 text-sm font-semibold tabular-nums text-slate-800'
        }
      >
        {value}
      </p>
    </div>
  )
}
