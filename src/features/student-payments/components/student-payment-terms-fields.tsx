import { useQueryClient } from '@tanstack/react-query'
import {
  CreditCard,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { parseISO } from 'date-fns'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
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
import {
  deleteStudentPaymentTerm,
  bulkUpdateStudentPaymentTermStatus,
  uploadStudentPaymentTermProof,
} from '../api/student-payments-api'
import {
  emptyTermFormValues,
  installmentAmountCap,
  installmentExceedsRemaining,
  remainingLabel,
  summarizeFormCollection,
  termStatusLabel,
  termStatusTone,
} from '../lib/payment-display'
import type {
  StudentPaymentFormErrors,
  StudentPaymentListItem,
  StudentPaymentTermFormValues,
  StudentPaymentTermStatus,
} from '../types/student-payment'

const MAX_PROOF_BYTES = 5 * 1024 * 1024
const CHECKBOX_CLASS =
  'size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40'

const STATUS_OPTIONS: { value: StudentPaymentTermStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'void', label: 'Void' },
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
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file))
    setUrls(next)
    return () => {
      for (const url of next) {
        URL.revokeObjectURL(url)
      }
    }
  }, [files])

  return urls
}

type DialogMode = { type: 'create' } | { type: 'edit'; key: string }

export function StudentPaymentTermsFields({
  terms,
  errors,
  lockStatus,
  savedTerms,
  plannedAmount,
  paymentId,
  defaultBranchId = '',
  onAdd,
  onRemove,
  onChange,
  onPersistTerm,
  onPersistNewTerm,
  onProofUploaded,
}: {
  terms: StudentPaymentTermFormValues[]
  errors: StudentPaymentFormErrors
  lockStatus: boolean
  savedTerms?: StudentPaymentListItem['terms']
  plannedAmount: string
  paymentId?: string
  defaultBranchId?: string
  onAdd: (initial?: Partial<StudentPaymentTermFormValues>) => void
  onRemove: (key: string) => void
  onChange: (
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
  onProofUploaded?: (payment: StudentPaymentListItem) => void
}) {
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []
  const summary = summarizeFormCollection(plannedAmount, terms)
  const remainingValue = Math.abs(summary.remaining)
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null)
  const [draft, setDraft] = useState<StudentPaymentTermFormValues>(
    emptyTermFormValues('pending', defaultBranchId),
  )
  const [pendingProofs, setPendingProofs] = useState<File[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<StudentPaymentTermStatus | ''>('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const pendingPreviewUrls = useObjectUrls(pendingProofs)

  const selectableTerms = terms.filter((term) => Boolean(term.id) || !paymentId)
  const allSelectableSelected =
    selectableTerms.length > 0 &&
    selectableTerms.every((term) => selectedKeys.includes(term.key))
  const someSelectableSelected = selectableTerms.some((term) =>
    selectedKeys.includes(term.key),
  )

  const editingTerm =
    dialogMode?.type === 'edit'
      ? terms.find((term) => term.key === dialogMode.key)
      : null
  const editingSaved = editingTerm?.id
    ? savedTerms?.find((item) => item.id === editingTerm.id)
    : undefined
  const canAttachProof = draft.status === 'pending'
  const amountCap = installmentAmountCap({
    plannedAmount,
    terms,
    editingKey: dialogMode?.type === 'edit' ? dialogMode.key : null,
    editingId: editingTerm?.id,
    nextStatus: draft.status,
  })
  const amountExceedsRemaining = installmentExceedsRemaining({
    plannedAmount,
    terms,
    editingKey: dialogMode?.type === 'edit' ? dialogMode.key : null,
    editingId: editingTerm?.id,
    nextStatus: draft.status,
    nextAmount: draft.amount,
  })

  useEffect(() => {
    if (!dialogMode) return
    if (dialogMode.type === 'create') {
      setDraft(emptyTermFormValues('pending', defaultBranchId))
      setPendingProofs([])
      return
    }
    const term = terms.find((item) => item.key === dialogMode.key)
    if (term) {
      setDraft({ ...term })
      setPendingProofs(term.proofFiles ? [...term.proofFiles] : [])
    }
    // Only reset when the dialog opens or switches target — keep staged files while editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- terms captured on open
  }, [dialogMode])

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
    if (next.length === 0) return
    setPendingProofs((current) => [...current, ...next])
  }

  function removePendingProof(index: number) {
    setPendingProofs((current) => current.filter((_, i) => i !== index))
  }

  function toggleTermSelected(key: string) {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }

  function toggleSelectAll() {
    if (allSelectableSelected) {
      setSelectedKeys([])
      return
    }
    setSelectedKeys(selectableTerms.map((term) => term.key))
  }

  function clearSelection() {
    setSelectedKeys([])
    setBulkStatus('')
  }

  async function handleBulkStatusApply() {
    if (!bulkStatus || selectedKeys.length === 0 || isBulkSubmitting) {
      return
    }

    const selectedTerms = terms.filter((term) => selectedKeys.includes(term.key))
    if (selectedTerms.length === 0) {
      return
    }

    setIsBulkSubmitting(true)
    try {
      let updatedCount = selectedTerms.length
      if (paymentId) {
        const termIds = selectedTerms
          .map((term) => term.id)
          .filter((id): id is string => Boolean(id))
        if (termIds.length === 0) {
          notify('error', {
            title: 'Unable to update status',
            description: 'Save the payment plan before bulk-updating installments.',
          })
          return
        }
        updatedCount = termIds.length
        const payment = await bulkUpdateStudentPaymentTermStatus(
          paymentId,
          termIds,
          bulkStatus,
        )
        await queryClient.invalidateQueries({
          queryKey: studentPaymentQueryKeys.all,
        })
        invalidateNavBadges()
        for (const term of selectedTerms) {
          if (!term.id || !termIds.includes(term.id)) continue
          const server = payment.terms.find((item) => item.id === term.id)
          onChange(term.key, {
            status: server?.status ?? bulkStatus,
          })
        }
        onProofUploaded?.(payment)
      } else {
        for (const term of selectedTerms) {
          onChange(term.key, { status: bulkStatus })
        }
      }
      notify('success', {
        title: 'Status updated',
        description: `Updated ${updatedCount} installment${updatedCount === 1 ? '' : 's'} to ${STATUS_OPTIONS.find((option) => option.value === bulkStatus)?.label ?? bulkStatus}.`,
      })
      clearSelection()
    } catch (error) {
      notify('error', {
        title: 'Unable to update status',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  async function handleDialogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (!dialogMode || isApplying) return

    const stagedFiles = canAttachProof ? pendingProofs : []
    const patch: Partial<StudentPaymentTermFormValues> = {
      amount: draft.amount,
      paymentDate: draft.paymentDate,
      status: draft.status,
      description: draft.description,
      branchId: draft.branchId,
      proofFiles: stagedFiles,
    }

    if (
      installmentExceedsRemaining({
        plannedAmount,
        terms,
        editingKey: dialogMode.type === 'edit' ? dialogMode.key : null,
        editingId:
          dialogMode.type === 'edit'
            ? terms.find((term) => term.key === dialogMode.key)?.id
            : null,
        nextStatus: draft.status,
        nextAmount: draft.amount,
      })
    ) {
      const cap =
        installmentAmountCap({
          plannedAmount,
          terms,
          editingKey: dialogMode.type === 'edit' ? dialogMode.key : null,
          editingId:
            dialogMode.type === 'edit'
              ? terms.find((term) => term.key === dialogMode.key)?.id
              : null,
          nextStatus: draft.status,
        }) ?? 0
      notify('error', {
        title: 'Amount exceeds remaining',
        description: `Installment amount cannot be greater than the remaining plan balance (${formatCurrencyAmount(cap)}).`,
      })
      return
    }

    setIsApplying(true)
    try {
      if (dialogMode.type === 'create') {
        if (paymentId && onPersistNewTerm) {
          const created = await onPersistNewTerm(patch)
          let payment = created?.payment ?? null

          if (
            paymentId &&
            created?.termId &&
            canAttachProof &&
            stagedFiles.length > 0
          ) {
            for (const file of stagedFiles) {
              payment = await uploadStudentPaymentTermProof(
                paymentId,
                created.termId,
                file,
              )
            }
            onChange(created.termKey, { proofFiles: [] })
          }

          await queryClient.invalidateQueries({
            queryKey: studentPaymentQueryKeys.all,
          })
          invalidateNavBadges()
          if (payment) onProofUploaded?.(payment)

          notify('success', {
            title: 'Installment added',
            description:
              stagedFiles.length > 0
                ? `Installment and ${stagedFiles.length} proof file${stagedFiles.length === 1 ? '' : 's'} were saved.`
                : 'Installment was saved to this payment plan.',
          })
          setDialogMode(null)
          return
        }

        onAdd(patch)
        notify('success', {
          title: 'Installment added',
          description:
            stagedFiles.length > 0
              ? `${stagedFiles.length} proof file${stagedFiles.length === 1 ? '' : 's'} staged — they upload when you save the plan.`
              : 'Remember to save the payment plan.',
        })
        setDialogMode(null)
        return
      }

      const term = terms.find((item) => item.key === dialogMode.key)
      const canPersist =
        Boolean(paymentId && term?.id && onPersistTerm)

      let payment: StudentPaymentListItem | null = null
      if (canPersist && onPersistTerm) {
        payment = await onPersistTerm(dialogMode.key, patch)
        await queryClient.invalidateQueries({
          queryKey: studentPaymentQueryKeys.all,
        })
        invalidateNavBadges()
      } else {
        onChange(dialogMode.key, patch)
      }

      if (
        paymentId &&
        term?.id &&
        canAttachProof &&
        stagedFiles.length > 0
      ) {
        for (const file of stagedFiles) {
          payment = await uploadStudentPaymentTermProof(
            paymentId,
            term.id,
            file,
          )
        }
        await queryClient.invalidateQueries({
          queryKey: studentPaymentQueryKeys.all,
        })
        onChange(dialogMode.key, { proofFiles: [] })
      }

      if (payment) onProofUploaded?.(payment)

      if (canPersist) {
        notify('success', {
          title: 'Installment saved',
          description:
            stagedFiles.length > 0
              ? `Details and ${stagedFiles.length} proof file${stagedFiles.length === 1 ? '' : 's'} were saved.`
              : 'Installment details were saved.',
        })
      } else {
        notify('success', {
          title: 'Installment updated',
          description:
            stagedFiles.length > 0
              ? `${stagedFiles.length} proof file${stagedFiles.length === 1 ? '' : 's'} staged — they upload when you save the plan.`
              : 'Remember to save the payment plan.',
        })
      }
      setDialogMode(null)
    } catch (error) {
      notify('error', {
        title: 'Unable to apply installment',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsApplying(false)
    }
  }

  function handleDeleteTerm(term: StudentPaymentTermFormValues, index: number) {
    if (terms.length <= 1) {
      notify('error', {
        title: 'Cannot delete installment',
        description:
          'Add more than one installment to enable delete. A payment plan must keep at least one.',
      })
      return
    }

    requestDeleteConfirm({
      title: 'Delete installment?',
      description: `This will permanently remove installment ${index + 1}${
        term.amount
          ? ` (${formatCurrencyAmount(parseCurrencyValue(term.amount))})`
          : ''
      } and any attached proofs.`,
      onConfirm: () => {
        void (async () => {
          try {
            if (paymentId && term.id) {
              const payment = await deleteStudentPaymentTerm(
                paymentId,
                term.id,
              )
              await queryClient.invalidateQueries({
                queryKey: studentPaymentQueryKeys.all,
              })
              invalidateNavBadges()
              onRemove(term.key)
              onProofUploaded?.(payment)
            } else {
              onRemove(term.key)
            }
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
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Installments</h3>
          <p className="mt-1 text-sm text-slate-500">
            Review terms in the table. Open an installment to edit details and
            attach proof in one step. Delete is available when the plan has more
            than one installment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold tabular-nums',
              summary.remaining > 0
                ? 'bg-amber-50 text-amber-700'
                : summary.remaining < 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700',
            )}
          >
            {remainingLabel(summary.remaining)}
            {summary.remaining === 0
              ? ''
              : ` ${formatCurrencyAmount(remainingValue)}`}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDialogMode({ type: 'create' })}
          >
            <Plus className="size-3.5" />
            Add installment
          </Button>
        </div>
      </div>

      {errors.terms ? <FieldError message={errors.terms} /> : null}

      {!lockStatus && selectedKeys.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#C8D4F5] bg-[#F5F8FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-700">
            <span className="font-semibold text-[#1B2A5A]">
              {selectedKeys.length}
            </span>{' '}
            selected
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={bulkStatus}
              onChange={(event) =>
                setBulkStatus(event.target.value as StudentPaymentTermStatus | '')
              }
              containerClassName="w-full sm:w-[180px]"
              aria-label="Bulk installment status"
              disabled={isBulkSubmitting}
            >
              <option value="">Set status…</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!bulkStatus || isBulkSubmitting}
                onClick={() => void handleBulkStatusApply()}
              >
                {isBulkSubmitting ? 'Updating…' : 'Apply'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isBulkSubmitting}
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[48rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              {!lockStatus ? (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    className={CHECKBOX_CLASS}
                    checked={allSelectableSelected}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          someSelectableSelected && !allSelectableSelected
                      }
                    }}
                    onChange={toggleSelectAll}
                    aria-label="Select all installments"
                  />
                </th>
              ) : null}
              <th className="w-12 px-3 py-3">#</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Payment date</th>
              <th className="px-3 py-3">Branch</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Proof</th>
              <th className="px-3 py-3">Notes</th>
              <th className="w-24 px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.length === 0 ? (
              <tr>
                <td
                  colSpan={lockStatus ? 8 : 9}
                  className="px-3 py-10 text-center text-sm text-slate-500"
                >
                  No installments yet. Use{' '}
                  <button
                    type="button"
                    onClick={() => setDialogMode({ type: 'create' })}
                    className="font-semibold text-[#253CA1] underline-offset-2 hover:underline"
                  >
                    Add installment
                  </button>{' '}
                  to get started.
                </td>
              </tr>
            ) : null}
            {terms.map((term, index) => {
              const saved = savedTerms?.find((item) => item.id === term.id)
              const termErrors = errors.termErrors?.[term.key]
              const hasRowError = Boolean(
                termErrors?.amount ||
                  termErrors?.paymentDate ||
                  termErrors?.status ||
                  termErrors?.description ||
                  termErrors?.branchId,
              )
              const isSelected = selectedKeys.includes(term.key)

              return (
                <tr
                  key={term.key}
                  className={cn(
                    'border-b border-slate-100 last:border-b-0',
                    term.status === 'void' && 'bg-rose-50/40',
                    term.status === 'approved' && 'bg-emerald-50/30',
                    !term.id && 'bg-slate-50/50',
                    hasRowError && 'bg-rose-50/60',
                    isSelected && 'bg-[#F5F8FF]',
                  )}
                >
                  {!lockStatus ? (
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        className={CHECKBOX_CLASS}
                        checked={isSelected}
                        disabled={Boolean(paymentId) && !term.id}
                        onChange={() => toggleTermSelected(term.key)}
                        aria-label={`Select installment ${index + 1}`}
                      />
                    </td>
                  ) : null}
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      {!term.id ? (
                        <span className="text-[10px] font-semibold text-slate-400">
                          Unsaved
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-3 font-semibold tabular-nums text-slate-900">
                    {term.amount
                      ? formatCurrencyAmount(parseCurrencyValue(term.amount))
                      : '—'}
                    <FieldError message={termErrors?.amount} />
                  </td>

                  <td className="px-3 py-3 text-slate-700">
                    {formatDisplayDate(term.paymentDate)}
                    <FieldError message={termErrors?.paymentDate} />
                  </td>

                  <td className="px-3 py-3 text-slate-700">
                    {branches.find((branch) => branch.id === term.branchId)
                      ?.name ??
                      saved?.branch ??
                      (term.branchId ? `#${term.branchId}` : '—')}
                    <FieldError message={termErrors?.branchId} />
                  </td>

                  <td className="px-3 py-3">
                    <DataTableBadge tone={termStatusTone(term.status)}>
                      {termStatusLabel(term.status)}
                    </DataTableBadge>
                    <FieldError message={termErrors?.status} />
                  </td>

                  <td className="px-3 py-3">
                    {(saved?.attachments.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {saved!.attachments.map((attachment, fileIndex) => (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={`Proof ${fileIndex + 1}`}
                            className="size-9 overflow-hidden rounded-lg ring-1 ring-[#C8D4F5] transition hover:ring-[#253CA1]"
                          >
                            <img
                              src={attachment.fileUrl}
                              alt={`Proof ${fileIndex + 1}`}
                              className="size-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (term.proofFiles?.length ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                        <ImagePlus className="size-3" />
                        {term.proofFiles!.length} ready to upload
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {term.status === 'pending' ? 'None yet' : '—'}
                      </span>
                    )}
                  </td>

                  <td className="max-w-[12rem] px-3 py-3">
                    <p className="truncate text-slate-600">
                      {term.description.trim() || '—'}
                    </p>
                    <FieldError message={termErrors?.description} />
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        aria-label={`Edit installment ${index + 1}`}
                        onClick={() =>
                          setDialogMode({ type: 'edit', key: term.key })
                        }
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF] hover:text-[#253CA1]"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete installment ${index + 1}`}
                        title={
                          terms.length <= 1
                            ? 'Add more than one installment to enable delete'
                            : `Delete installment ${index + 1}`
                        }
                        disabled={terms.length <= 1}
                        onClick={() => handleDeleteTerm(term, index)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open && !isApplying) setDialogMode(null)
        }}
      >
        <DialogContent
          showClose
          className="flex max-h-[min(90vh,52rem)] flex-col overflow-hidden p-0 sm:max-w-lg"
        >
          <form
            onSubmit={(event) => void handleDialogSubmit(event)}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0 bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]">
                <CreditCard className="size-5" />
              </div>
              <DialogHeader className="pr-0">
                <DialogTitle>
                  {dialogMode?.type === 'create'
                    ? 'Add installment'
                    : 'Edit installment'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the installment details and optionally attach payment
                  proof images. Files are listed first, then uploaded when you
                  confirm.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="installment-amount">Amount</Label>
                  <CurrencyInput
                    id="installment-amount"
                    value={draft.amount}
                    onValueChange={(digits) =>
                      setDraft((current) => ({ ...current, amount: digits }))
                    }
                    placeholder="0"
                  />
                  {amountCap != null ? (
                    <p
                      className={cn(
                        'text-xs',
                        amountExceedsRemaining
                          ? 'font-medium text-rose-600'
                          : 'text-slate-400',
                      )}
                    >
                      {amountExceedsRemaining
                        ? `Amount cannot exceed the remaining balance of ${formatCurrencyAmount(amountCap)}.`
                        : `Remaining on plan: ${formatCurrencyAmount(amountCap)}.`}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installment-date">Payment date</Label>
                  <DatePicker
                    value={parseDateValue(draft.paymentDate)}
                    onChange={(date) =>
                      setDraft((current) => ({
                        ...current,
                        paymentDate: toDateString(date),
                      }))
                    }
                    placeholder="Pick payment date"
                    title="Payment date"
                    className="h-12 w-full justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                    align="start"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment-branch">Payment branch</Label>
                <Select
                  id="installment-branch"
                  containerClassName="w-full"
                  value={draft.branchId}
                  disabled={branchesQuery.isLoading}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      branchId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select branch...</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-slate-400">
                  Branch where this installment was made. Used for marketing
                  commission attribution.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment-status">Status</Label>
                <Select
                  id="installment-status"
                  containerClassName="w-full"
                  value={draft.status}
                  disabled={lockStatus}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target
                        .value as StudentPaymentTermFormValues['status'],
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="void">Void</option>
                </Select>
                {lockStatus ? (
                  <p className="text-xs text-slate-400">
                    You can view this status. Finance updates it.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="installment-notes">Notes</Label>
                <Textarea
                  id="installment-notes"
                  className="min-h-20"
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional notes for this installment"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-900">
                  Payment proof
                </p>
                {(editingSaved?.attachments.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Uploaded proofs ({editingSaved!.attachments.length})
                    </p>
                    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {editingSaved!.attachments.map((attachment, fileIndex) => (
                        <li
                          key={attachment.id}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block aspect-square bg-slate-50"
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
                  </div>
                ) : null}

                {canAttachProof ? (
                  <>
                    <label
                      htmlFor="installment-proof"
                      className="flex h-12 cursor-pointer items-center gap-3 rounded-full border border-dashed border-slate-300 bg-white px-4 text-sm text-slate-600 shadow-sm transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF]"
                    >
                      <ImagePlus className="size-4 shrink-0 text-[#253CA1]" />
                      <span className="flex-1 truncate">
                        Click to select one or more images
                      </span>
                      <input
                        id="installment-proof"
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

                    {pendingProofs.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Ready to upload ({pendingProofs.length})
                        </p>
                        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {pendingProofs.map((file, fileIndex) => (
                            <li
                              key={`${file.name}-${file.size}-${file.lastModified}-${fileIndex}`}
                              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                              <div className="aspect-square bg-slate-50">
                                {pendingPreviewUrls[fileIndex] ? (
                                  <img
                                    src={pendingPreviewUrls[fileIndex]}
                                    alt={file.name}
                                    className="size-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <button
                                type="button"
                                aria-label={`Remove ${file.name}`}
                                onClick={() => removePendingProof(fileIndex)}
                                className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <X className="size-3" />
                              </button>
                              <p className="truncate px-1.5 py-1 text-[10px] text-slate-500">
                                {formatFileSize(file.size)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <p className="text-xs text-slate-400">
                      {pendingProofs.length > 0
                        ? editingTerm?.id && paymentId
                          ? 'Previews upload when you click Apply.'
                          : 'Previews upload when you save the payment plan.'
                        : 'Select one or more images (max 5 MB each).'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">
                    Proof can only be attached while the installment is pending.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDialogMode(null)}
                disabled={isApplying}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isApplying || amountExceedsRemaining}>
                {isApplying
                  ? 'Applying…'
                  : dialogMode?.type === 'create'
                    ? 'Add installment'
                    : 'Apply'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export function PaymentCollectionSummary({
  plannedAmount,
  terms,
  linkedPredictionAmount = 0,
}: {
  plannedAmount: string
  terms: StudentPaymentTermFormValues[]
  linkedPredictionAmount?: number
}) {
  const summary = summarizeFormCollection(plannedAmount, terms)
  const remainingValue = Math.abs(summary.remaining)
  const commissionBase = summary.planned + linkedPredictionAmount

  const message =
    summary.planned <= 0
      ? 'Enter a planned amount to track collection progress.'
      : summary.remaining > 0
        ? `${formatCurrencyAmount(summary.remaining)} still needed from approved installments.`
        : summary.remaining < 0
          ? `Approved installments exceed the plan by ${formatCurrencyAmount(remainingValue)}.`
          : 'Approved installments cover the planned amount.'

  return (
    <div className="space-y-4 rounded-2xl border border-[#D7E4F6] bg-[linear-gradient(180deg,#F5F8FF_0%,#FFFFFF_100%)] p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="Planned" value={summary.planned} />
        <SummaryStat
          label="Approved"
          value={summary.approved}
          hint={`${summary.approvedCount} installment${summary.approvedCount === 1 ? '' : 's'}`}
        />
        <SummaryStat
          label="Pending"
          value={summary.pending}
          hint={`${summary.pendingCount} awaiting approval`}
        />
        <SummaryStat
          label={remainingLabel(summary.remaining)}
          value={remainingValue}
          tone={
            summary.remaining > 0
              ? 'warning'
              : summary.remaining < 0
                ? 'danger'
                : 'success'
          }
        />
      </div>
      {linkedPredictionAmount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2.5 ring-1 ring-[#C8D4F5]">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-[#253CA1] uppercase">
              Linked pretest in plan
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Commission base = planned + pretest (once per person)
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums text-[#1B2A5A]">
              +{formatCurrencyAmount(linkedPredictionAmount)}
            </p>
            <p className="text-xs font-semibold tabular-nums text-slate-700">
              {formatCurrencyAmount(commissionBase)} total
            </p>
          </div>
        </div>
      ) : null}
      <PaymentProgress
        paidAmount={summary.approved}
        fullAmount={summary.planned}
      />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: number
  hint?: string
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-slate-100">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-sm font-bold tabular-nums',
          tone === 'warning' && 'text-amber-700',
          tone === 'danger' && 'text-rose-700',
          tone === 'success' && 'text-emerald-700',
          tone === 'neutral' && 'text-slate-900',
        )}
      >
        {formatCurrencyAmount(value)}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
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
