import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { parseISO } from 'date-fns'
import { useEffect, useState, type ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import {
  formatCurrencyAmount,
  parseCurrencyValue,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'
import { deleteStudentPaymentTerm } from '../api/student-payments-api'
import {
  emptyTermFormValues,
  installmentExceedsRemaining,
  splitCurrencyAmount,
  summarizeFormCollection,
  termStatusLabel,
  termStatusTone,
  todayIsoDate,
  unallocatedPlanAmount,
} from '../lib/payment-display'
import type {
  StudentPaymentFormErrors,
  StudentPaymentListItem,
  StudentPaymentTerm,
  StudentPaymentTermFormValues,
  StudentPaymentTermStatus,
} from '../types/student-payment'

const MAX_PROOF_BYTES = 5 * 1024 * 1024
const CHECKBOX_CLASS =
  'size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40'
const EMPTY_FILES: File[] = []
const SPLIT_PARTS = [1, 2] as const

const STATUS_OPTIONS: {
  value: StudentPaymentTermStatus
  label: string
  activeClass: string
}[] = [
  { value: 'pending', label: 'Pending', activeClass: 'bg-[#253CA1] text-white shadow-sm' },
  {
    value: 'approved',
    label: 'Approved',
    activeClass: 'bg-emerald-600 text-white shadow-sm',
  },
  { value: 'void', label: 'Void', activeClass: 'bg-rose-600 text-white shadow-sm' },
]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-rose-500">{message}</p>
}

function parseDateValue(value: string) {
  if (!value) return undefined
  try {
    return parseISO(value)
  } catch {
    return undefined
  }
}

function toDateString(date: Date | undefined) {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(value?: string) {
  if (!value) return 'No date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function useObjectUrls(files: File[] | undefined) {
  const list = files && files.length > 0 ? files : EMPTY_FILES
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const next = list.map((file) => URL.createObjectURL(file))
    setUrls(next)
    return () => {
      for (const url of next) URL.revokeObjectURL(url)
    }
  }, [list])

  return urls
}

function splitHint(total: number, parts: number) {
  if (parts === 2) return 'One payment now. Amounts can differ.'
  const amounts = splitCurrencyAmount(total, parts)
  if (amounts.length === 0) return 'Amount due is zero'
  const first = amounts[0] ?? 0
  return formatCurrencyAmount(first)
}

function splitLabel(parts: number) {
  return parts === 1 ? 'Pay in full' : '2 payments'
}

function InstallmentPlanNotice({
  termCount,
  savedTermCount,
  approved,
  approvedBy,
  canApprove,
  isApproving,
  onApprove,
}: {
  termCount: number
  savedTermCount: number
  approved: boolean
  approvedBy: string
  canApprove: boolean
  isApproving: boolean
  onApprove?: () => void
}) {
  if (termCount < 2) return null

  const savedAndApproved = approved
  if (savedAndApproved) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        2-payment plan approved
        {approvedBy ? ` by ${approvedBy}` : ''}.
      </div>
    )
  }

  if (canApprove && savedTermCount >= 1 && onApprove) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-950">
          This 2-payment plan is waiting for approval from finance, a branch
          manager, or a system admin. Installments stay pending until then.
        </p>
        <Button
          type="button"
          size="sm"
          disabled={isApproving}
          onClick={onApprove}
        >
          {isApproving ? 'Approving…' : 'Approve 2-payment plan'}
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {canApprove
        ? 'Saving approves this 2-payment plan. Enter each payment amount yourself — they do not have to match.'
        : 'Payment amounts stay blank until finance, a branch manager, or a system admin approves this plan. The two payments can be different amounts.'}
    </div>
  )
}

export function StudentPaymentTermsFields({
  terms,
  errors,
  lockStatus,
  savedTerms,
  plannedAmount,
  zeroIsCapped = false,
  paymentId,
  defaultBranchId = '',
  installmentPlan = '',
  onInstallmentPlanChange,
  installmentPlanApproved = false,
  installmentPlanApprovedBy = '',
  canApproveInstallmentPlan = false,
  isApprovingInstallmentPlan = false,
  savedTermCount = 0,
  onApproveInstallmentPlan,
  onAdd,
  onReplace,
  onRemove,
  onChange,
  onProofUploaded,
}: {
  terms: StudentPaymentTermFormValues[]
  errors: StudentPaymentFormErrors
  lockStatus: boolean
  savedTerms?: StudentPaymentListItem['terms']
  plannedAmount: string
  zeroIsCapped?: boolean
  paymentId?: string
  defaultBranchId?: string
  installmentPlan?: 'full' | 'two' | ''
  onInstallmentPlanChange?: (plan: 'full' | 'two') => void
  installmentPlanApproved?: boolean
  installmentPlanApprovedBy?: string
  canApproveInstallmentPlan?: boolean
  isApprovingInstallmentPlan?: boolean
  savedTermCount?: number
  onApproveInstallmentPlan?: () => void
  onAdd: (initial?: Partial<StudentPaymentTermFormValues>) => void | string
  onReplace: (terms: StudentPaymentTermFormValues[]) => void
  onRemove: (key: string) => void
  onChange: (key: string, patch: Partial<StudentPaymentTermFormValues>) => void
  onProofUploaded?: (payment: StudentPaymentListItem) => void
}) {
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []
  const planned = parseCurrencyValue(plannedAmount)
  const canReplaceSchedule = terms.every((term) => !term.id)
  const scheduleDirty = terms.some(
    (term) =>
      parseCurrencyValue(term.amount) > 0 ||
      term.description.trim().length > 0 ||
      (term.proofFiles?.length ?? 0) > 0,
  )
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [pendingSplit, setPendingSplit] = useState<number | null>(null)
  const [explicitPlan, setExplicitPlan] = useState<1 | 2 | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const amountsLocked =
    installmentPlan === 'two' &&
    !installmentPlanApproved &&
    !canApproveInstallmentPlan
  const planChoice: 1 | 2 | null =
    installmentPlan === 'two'
      ? 2
      : installmentPlan === 'full'
        ? 1
        : explicitPlan

  const allSelected =
    terms.length > 0 && terms.every((term) => selectedKeys.includes(term.key))

  useEffect(() => {
    setSelectedKeys((current) => {
      const next = current.filter((key) =>
        terms.some((term) => term.key === key),
      )
      return next.length === current.length ? current : next
    })
  }, [terms])

  useEffect(() => {
    const failed = terms.find((term) => errors.termErrors?.[term.key])
    if (failed) setOpenKey(failed.key)
  }, [errors, terms])

  function branchName(term: StudentPaymentTermFormValues) {
    return (
      branches.find((branch) => branch.id === term.branchId)?.name ??
      savedTerms?.find((item) => item.id === term.id)?.branch ??
      ''
    )
  }

  function addSecondPayment() {
    if (amountsLocked || planChoice !== 2 || terms.length !== 1) return
    const key = onAdd({
      amount: '',
      status: 'pending',
      branchId: defaultBranchId,
    })
    if (typeof key === 'string') setOpenKey(key)
    setPendingSplit(null)
  }

  function applySplit(parts: number) {
    if (planned <= 0 || !canReplaceSchedule) return
    const start = todayIsoDate()
    const next = [
      {
        ...emptyTermFormValues('pending', defaultBranchId),
        amount: parts === 1 ? String(planned) : '',
        paymentDate: start,
      },
    ]
    onReplace(next)
    onInstallmentPlanChange?.(parts === 1 ? 'full' : 'two')
    setExplicitPlan(parts === 1 ? 1 : 2)
    setOpenKey(defaultBranchId ? null : (next[0]?.key ?? null))
    setPendingSplit(null)
    setSelectedKeys([])
  }

  function requestSplit(parts: number) {
    if (planned <= 0) return
    if (terms.length > 0 && scheduleDirty) {
      setPendingSplit(parts)
      return
    }
    applySplit(parts)
  }

  function selectPlan(parts: 1 | 2) {
    if (planned <= 0 || parts === planChoice) return
    if (!canReplaceSchedule && parts === 1 && terms.length > 1) return
    if (!canReplaceSchedule) {
      onInstallmentPlanChange?.(parts === 1 ? 'full' : 'two')
      setExplicitPlan(parts)
      if (parts === 2 && terms[0]) {
        const firstAmount = parseCurrencyValue(terms[0].amount)
        const holdsEntirePlan =
          terms.length === 1 && firstAmount > 0 && firstAmount >= planned
        if (
          (holdsEntirePlan && terms[0].status !== 'approved') ||
          (!canApproveInstallmentPlan && !installmentPlanApproved)
        ) {
          onChange(terms[0].key, { amount: '' })
        }
      }
      return
    }
    requestSplit(parts)
  }

  function toggleTermSelected(key: string) {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }

  function applyBulkStatus(status: StudentPaymentTermStatus) {
    if (selectedKeys.length === 0 || isBulkSubmitting || lockStatus) return
    setIsBulkSubmitting(true)
    try {
      for (const term of terms) {
        if (!selectedKeys.includes(term.key) || term.status === status) continue
        onChange(term.key, { status })
      }
      const label =
        STATUS_OPTIONS.find((option) => option.value === status)?.label ??
        status
      notify('success', {
        title: 'Status updated',
        description: `${selectedKeys.length} installment${selectedKeys.length === 1 ? '' : 's'} marked ${label.toLowerCase()}. Save the plan to keep it.`,
      })
      setSelectedKeys([])
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  function handleDeleteTerm(term: StudentPaymentTermFormValues, index: number) {
    if (terms.length <= 1) {
      notify('error', {
        title: 'Cannot delete installment',
        description:
          'Add another installment first. A payment plan keeps at least one.',
      })
      return
    }

    requestDeleteConfirm({
      title: 'Delete installment?',
      description: `This removes installment ${index + 1}${
        term.amount
          ? ` (${formatCurrencyAmount(parseCurrencyValue(term.amount))})`
          : ''
      } and any attached proofs.`,
      onConfirm: () => {
        void (async () => {
          try {
            if (paymentId && term.id) {
              const payment = await deleteStudentPaymentTerm(paymentId, term.id)
              await queryClient.invalidateQueries({
                queryKey: studentPaymentQueryKeys.all,
              })
              invalidateNavBadges()
              onRemove(term.key)
              onProofUploaded?.(payment)
            } else {
              onRemove(term.key)
            }
            if (openKey === term.key) setOpenKey(null)
            notify('success', {
              title: 'Installment deleted',
              description: `Installment ${index + 1} has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete installment',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <div className="space-y-4">
      {errors.terms ? <FieldError message={errors.terms} /> : null}

      {planned > 0 || terms.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Payment plan">
            {SPLIT_PARTS.map((parts) => {
              const isActive = planChoice === parts
              const lockedFull =
                parts === 1 && !canReplaceSchedule && terms.length > 1
              return (
                <button
                  key={parts}
                  type="button"
                  aria-pressed={isActive}
                  data-active={isActive ? 'true' : 'false'}
                  disabled={planned <= 0 || lockedFull}
                  onClick={() => selectPlan(parts)}
                  className={cn(
                    'rounded-2xl border px-3 py-2.5 text-left transition',
                    isActive
                      ? 'border-[#253CA1] bg-[#F5F8FF] ring-2 ring-[#253CA1]'
                      : 'border-slate-200 bg-white hover:border-[#C8D4F5] hover:bg-[#F5F8FF]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="block text-sm font-semibold text-slate-800">
                      {splitLabel(parts)}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-semibold tracking-wide text-[#253CA1] uppercase">
                        Selected
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    {splitHint(planned, parts)}
                  </span>
                </button>
              )
            })}
          </div>
          {planChoice === 2 || pendingSplit === 2 ? (
            <InstallmentPlanNotice
              termCount={Math.max(terms.length, planChoice === 2 || pendingSplit === 2 ? 2 : 0)}
              savedTermCount={savedTermCount}
              approved={installmentPlanApproved}
              approvedBy={installmentPlanApprovedBy}
              canApprove={canApproveInstallmentPlan}
              isApproving={isApprovingInstallmentPlan}
              onApprove={onApproveInstallmentPlan}
            />
          ) : null}
          {pendingSplit ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-sm text-amber-900">
                Replace this schedule with {splitLabel(pendingSplit).toLowerCase()}?
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPendingSplit(null)}
                >
                  Keep current
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applySplit(pendingSplit)}
                >
                  Replace
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!lockStatus && selectedKeys.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#C8D4F5] bg-[#F5F8FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-700">
            <span className="font-semibold text-[#1B2A5A]">
              {selectedKeys.length}
            </span>{' '}
            selected
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant="secondary"
                disabled={isBulkSubmitting}
                onClick={() => applyBulkStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isBulkSubmitting}
              onClick={() => setSelectedKeys([])}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {terms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No installments yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {planned > 0
              ? 'Choose pay in full or 2 payments above.'
              : 'The amount due is zero, so this plan can be saved without installments.'}
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {terms.map((term, index) => (
            <InstallmentCard
              key={term.key}
              index={index}
              term={term}
              saved={savedTerms?.find((item) => item.id === term.id)}
              errors={errors.termErrors?.[term.key]}
              open={openKey === term.key}
              selected={selectedKeys.includes(term.key)}
              lockStatus={lockStatus}
              lockAmount={amountsLocked}
              hideFillAmount={planChoice === 2 && index === 0}
              showSelection={!lockStatus && terms.length > 1}
              canDelete={terms.length > 1}
              plannedAmount={plannedAmount}
              zeroIsCapped={zeroIsCapped}
              terms={terms}
              branches={branches}
              branchesLoading={branchesQuery.isLoading}
              branchLabel={branchName(term)}
              onToggle={() =>
                setOpenKey((current) => (current === term.key ? null : term.key))
              }
              onToggleSelected={() => toggleTermSelected(term.key)}
              onChange={(patch) => onChange(term.key, patch)}
              onDelete={() => handleDeleteTerm(term, index)}
            />
          ))}
        </ol>
      )}

      {terms.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {planChoice === 2 && terms.length === 1 && !amountsLocked ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addSecondPayment}
            >
              <Plus className="size-3.5" />
              Add second payment
            </Button>
          ) : null}
          {!lockStatus && terms.length > 1 ? (
            <button
              type="button"
              onClick={() =>
                setSelectedKeys(
                  allSelected ? [] : terms.map((term) => term.key),
                )
              }
              className="ml-auto text-xs font-semibold text-[#253CA1] hover:underline"
            >
              {allSelected ? 'Clear selection' : 'Select all'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function InstallmentCard({
  index,
  term,
  saved,
  errors,
  open,
  selected,
  lockStatus,
  lockAmount = false,
  hideFillAmount = false,
  showSelection,
  canDelete,
  plannedAmount,
  zeroIsCapped = false,
  terms,
  branches,
  branchesLoading,
  branchLabel,
  onToggle,
  onToggleSelected,
  onChange,
  onDelete,
}: {
  index: number
  term: StudentPaymentTermFormValues
  saved?: StudentPaymentTerm
  errors?: Partial<
    Record<'amount' | 'status' | 'description' | 'paymentDate' | 'branchId', string>
  >
  open: boolean
  selected: boolean
  lockStatus: boolean
  lockAmount?: boolean
  hideFillAmount?: boolean
  showSelection: boolean
  canDelete: boolean
  plannedAmount: string
  zeroIsCapped?: boolean
  terms: StudentPaymentTermFormValues[]
  branches: Array<{ id: string; name: string }>
  branchesLoading: boolean
  branchLabel: string
  onToggle: () => void
  onToggleSelected: () => void
  onChange: (patch: Partial<StudentPaymentTermFormValues>) => void
  onDelete: () => void
}) {
  const amountValue = parseCurrencyValue(term.amount)
  const exceeds = installmentExceedsRemaining({
    plannedAmount,
    zeroIsCapped,
    terms,
    editingKey: term.key,
    editingId: term.id,
    nextStatus: term.status,
    nextAmount: term.amount,
  })
  const room = Math.max(
    0,
    unallocatedPlanAmount(plannedAmount, terms) +
      (term.status === 'void' ? 0 : amountValue),
  )
  const hasError = Boolean(
    errors?.amount ||
      errors?.paymentDate ||
      errors?.status ||
      errors?.description ||
      errors?.branchId,
  )
  const proofCount =
    (saved?.attachments.length ?? 0) + (term.proofFiles?.length ?? 0)

  return (
    <li
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        term.status === 'void' && 'bg-rose-50/30',
        selected && 'border-[#C8D4F5] ring-1 ring-[#253CA1]/15',
        hasError && 'border-rose-200',
      )}
    >
      <div className="flex items-start gap-3 px-3 py-3 sm:px-4">
        {showSelection ? (
          <input
            type="checkbox"
            className={cn(CHECKBOX_CLASS, 'mt-1')}
            checked={selected}
            onChange={onToggleSelected}
            aria-label={`Select installment ${index + 1}`}
          />
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
              term.status === 'approved'
                ? 'bg-emerald-600'
                : term.status === 'void'
                  ? 'bg-rose-400'
                  : 'bg-[#253CA1]',
            )}
          >
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-sm font-bold tabular-nums text-slate-900',
                  term.status === 'void' && 'text-slate-400 line-through',
                )}
              >
                {term.amount ? formatCurrencyAmount(amountValue) : 'Amount not set'}
              </span>
              {!open ? (
                <DataTableBadge tone={termStatusTone(term.status)}>
                  {termStatusLabel(term.status)}
                </DataTableBadge>
              ) : null}
              {!term.id ? (
                <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  New
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {formatDisplayDate(term.paymentDate)}
              {branchLabel ? ` · ${branchLabel}` : ''}
              {proofCount > 0
                ? ` · ${proofCount} proof${proofCount === 1 ? '' : 's'}`
                : ''}
              {term.description.trim() ? ` · ${term.description.trim()}` : ''}
            </span>
            {hasError && !open ? (
              <span className="mt-1 block text-xs text-rose-500">
                {errors?.amount ||
                  errors?.paymentDate ||
                  errors?.branchId ||
                  errors?.status ||
                  errors?.description}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              'mt-1 size-4 shrink-0 text-slate-400 transition',
              open && 'rotate-180',
            )}
          />
        </button>
        <button
          type="button"
          aria-label={`Delete installment ${index + 1}`}
          title={
            canDelete
              ? `Delete installment ${index + 1}`
              : 'Add another installment before deleting this one'
          }
          disabled={!canDelete}
          onClick={onDelete}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-slate-100 px-3 py-4 sm:px-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={`installment-amount-${term.key}`}>Amount</Label>
                {!lockAmount &&
                !hideFillAmount &&
                term.status !== 'void' &&
                room > 0 &&
                amountValue !== room ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#253CA1] hover:underline"
                    onClick={() => onChange({ amount: String(room) })}
                  >
                    Fill {formatCurrencyAmount(room)}
                  </button>
                ) : null}
              </div>
              <CurrencyInput
                id={`installment-amount-${term.key}`}
                value={lockAmount ? '' : term.amount}
                onValueChange={(digits) => onChange({ amount: digits })}
                placeholder="0"
                disabled={lockAmount}
                aria-invalid={Boolean(errors?.amount) || exceeds}
              />
              {lockAmount ? (
                <p className="text-xs text-slate-500">
                  Available after the 2-payment plan is approved.
                </p>
              ) : exceeds ? (
                <p className="text-xs font-medium text-rose-600">
                  {errors?.amount ||
                    'This amount is above what is left on the plan.'}
                </p>
              ) : (
                <FieldError message={errors?.amount} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Payment date</Label>
              <DatePicker
                value={parseDateValue(term.paymentDate)}
                onChange={(date) => onChange({ paymentDate: toDateString(date) })}
                placeholder="Pick payment date"
                title="Payment date"
                className="h-12 w-full justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                align="start"
              />
              <FieldError message={errors?.paymentDate} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`installment-branch-${term.key}`}>
                Payment branch
              </Label>
              <Select
                id={`installment-branch-${term.key}`}
                containerClassName="w-full"
                value={term.branchId}
                disabled={branchesLoading}
                onChange={(event) => onChange({ branchId: event.target.value })}
              >
                <option value="">Select branch...</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
              <FieldError message={errors?.branchId} />
            </div>
            <div className="space-y-2">
              <p
                id={`installment-status-${term.key}`}
                className="text-sm font-medium text-slate-700"
              >
                Status
              </p>
              <StatusPicker
                value={term.status}
                disabled={lockStatus}
                labelledBy={`installment-status-${term.key}`}
                onChange={(status) => onChange({ status })}
              />
              {lockStatus ? (
                <p className="text-xs text-slate-400">
                  You can view this status. Finance updates it.
                </p>
              ) : null}
              <FieldError message={errors?.status} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`installment-notes-${term.key}`}>Notes</Label>
            <Textarea
              id={`installment-notes-${term.key}`}
              className="min-h-20"
              value={term.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="Optional note, such as transfer reference"
            />
            <FieldError message={errors?.description} />
          </div>

          <ProofEditor
            termKey={term.key}
            status={term.status}
            files={term.proofFiles}
            savedAttachments={saved?.attachments ?? []}
            onAddFiles={(files) =>
              onChange({ proofFiles: [...(term.proofFiles ?? []), ...files] })
            }
            onRemoveFile={(fileIndex) =>
              onChange({
                proofFiles: (term.proofFiles ?? []).filter(
                  (_, proofIndex) => proofIndex !== fileIndex,
                ),
              })
            }
          />
        </div>
      ) : null}
    </li>
  )
}

function StatusPicker({
  value,
  disabled,
  labelledBy,
  onChange,
}: {
  value: StudentPaymentTermStatus
  disabled: boolean
  labelledBy: string
  onChange: (status: StudentPaymentTermStatus) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1"
    >
      {STATUS_OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-8 rounded-full text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
              selected ? option.activeClass : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function ProofEditor({
  termKey,
  status,
  files,
  savedAttachments,
  onAddFiles,
  onRemoveFile,
}: {
  termKey: string
  status: StudentPaymentTermStatus
  files: File[] | undefined
  savedAttachments: StudentPaymentTerm['attachments']
  onAddFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
}) {
  const previewUrls = useObjectUrls(files)
  const pending = files ?? EMPTY_FILES

  function addProofFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const next: File[] = []
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_PROOF_BYTES) {
        notify('error', {
          title: 'File too large',
          description: `${file.name} must be 5 MB or smaller.`,
        })
        continue
      }
      next.push(file)
    }
    if (next.length > 0) onAddFiles(next)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-900">Payment proof</p>
      {savedAttachments.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {savedAttachments.map((attachment, fileIndex) => (
            <li key={attachment.id}>
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200"
              >
                <img
                  src={attachment.fileUrl}
                  alt={`Proof ${fileIndex + 1}`}
                  className="size-full object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {status === 'pending' ? (
        <>
          <label
            htmlFor={`installment-proof-${termKey}`}
            className="flex h-12 cursor-pointer items-center gap-3 rounded-full border border-dashed border-slate-300 bg-white px-4 text-sm text-slate-600 shadow-sm transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF]"
          >
            <ImagePlus className="size-4 shrink-0 text-[#253CA1]" />
            <span className="flex-1 truncate">Add proof images</span>
            <input
              id={`installment-proof-${termKey}`}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                addProofFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
          {pending.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {pending.map((file, fileIndex) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}-${fileIndex}`}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="aspect-square bg-slate-50">
                    {previewUrls[fileIndex] ? (
                      <img
                        src={previewUrls[fileIndex]}
                        alt={file.name}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => onRemoveFile(fileIndex)}
                    className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:text-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                  <p className="truncate px-1.5 py-1 text-[10px] text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-xs text-slate-400">
            {pending.length > 0
              ? 'These images upload when you save the plan.'
              : 'Images up to 5 MB, while the installment is pending.'}
          </p>
        </>
      ) : (
        <p className="text-xs text-slate-400">
          Switch this installment back to pending to attach proof.
        </p>
      )}
    </div>
  )
}

export function PaymentCollectionSummary({
  plannedAmount,
  courseFee = 0,
  terms,
}: {
  plannedAmount: string
  courseFee?: number
  terms: StudentPaymentTermFormValues[]
}) {
  const summary = summarizeFormCollection(plannedAmount, terms)
  const scheduled = summary.approved + summary.pending
  const unscheduled = Math.max(0, summary.planned - scheduled)
  const overScheduled = Math.max(0, scheduled - summary.planned)
  const scale = Math.max(summary.planned, scheduled, 1)
  const approvedPct = (summary.approved / scale) * 100
  const pendingPct = (summary.pending / scale) * 100

  const message =
    courseFee <= 0
      ? 'Enter a course fee to see whether the schedule covers what is owed.'
      : summary.planned <= 0
        ? 'Discount and pretest credit cover the course fee. Nothing is left to collect.'
        : overScheduled > 0
          ? `This schedule is ${formatCurrencyAmount(overScheduled)} over the amount due.`
          : unscheduled > 0
            ? `${formatCurrencyAmount(unscheduled)} of the amount due is still not on the schedule.`
            : summary.remaining > 0
              ? `The schedule covers the amount due. ${formatCurrencyAmount(summary.remaining)} still needs approval.`
              : summary.remaining < 0
                ? `Approved installments are ${formatCurrencyAmount(Math.abs(summary.remaining))} over the amount due.`
                : 'Approved installments cover the amount due.'

  return (
    <div className="space-y-3 rounded-2xl border border-[#D7E4F6] bg-[linear-gradient(180deg,#F5F8FF_0%,#FFFFFF_100%)] p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Collected
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
            {formatCurrencyAmount(summary.approved)}
            <span className="ml-1 text-sm font-medium text-slate-400">
              of {formatCurrencyAmount(summary.planned)} due
            </span>
          </p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-[#253CA1]">
          {summary.percent}% approved
        </p>
      </div>

      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-slate-200/80"
        role="img"
        aria-label={`${summary.percent}% of the plan is approved`}
      >
        <div
          className="h-full bg-emerald-500 transition-[width] duration-300"
          style={{ width: `${approvedPct}%` }}
        />
        <div
          className="h-full bg-[#253CA1] transition-[width] duration-300"
          style={{ width: `${pendingPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <LegendDot
          color="bg-emerald-500"
          label="Approved"
          value={formatCurrencyAmount(summary.approved)}
        />
        <LegendDot
          color="bg-[#253CA1]"
          label="Pending"
          value={formatCurrencyAmount(summary.pending)}
        />
        <LegendDot
          color={overScheduled > 0 ? 'bg-rose-400' : 'bg-slate-300'}
          label={overScheduled > 0 ? 'Over' : 'Unscheduled'}
          value={formatCurrencyAmount(
            overScheduled > 0 ? overScheduled : unscheduled,
          )}
        />
      </div>

      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

function LegendDot({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
        <span className={cn('size-2 rounded-full', color)} />
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-slate-700">
        {value}
      </p>
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
  required,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  )
}

export function PaymentProgress({
  paidAmount,
  fullAmount,
  compact = false,
  size = 'md',
}: {
  paidAmount: number
  fullAmount: number
  compact?: boolean
  size?: 'md' | 'lg'
}) {
  const pct =
    fullAmount > 0
      ? Math.min(Math.round((paidAmount / fullAmount) * 100), 100)
      : 0

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'overflow-hidden rounded-full bg-slate-100',
          size === 'lg' ? 'h-2.5' : 'h-1.5',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            pct >= 100 ? 'bg-[#3D9B6E]' : 'bg-[#253CA1]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {compact ? null : (
        <p className="text-[11px] font-medium text-slate-400 tabular-nums">
          {pct}% collected
        </p>
      )}
    </div>
  )
}
