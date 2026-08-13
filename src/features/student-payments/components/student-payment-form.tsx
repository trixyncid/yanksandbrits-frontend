import { ImagePlus } from 'lucide-react'
import { useMemo, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useIsRestrictedMarketing } from '../../auth/hooks/use-permissions'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import type {
  StudentPaymentFormErrors,
  StudentPaymentFormValues,
  StudentPaymentListItem,
} from '../types/student-payment'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
}

function Field({
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

type StudentPaymentFormProps = {
  mode: 'create' | 'edit'
  values: StudentPaymentFormValues
  errors: StudentPaymentFormErrors
  isSubmitting: boolean
  lockStudent?: boolean
  meta?: Pick<
    StudentPaymentListItem,
    'createdBy' | 'branch' | 'transactionDate'
  >
  onChange: <K extends keyof StudentPaymentFormValues>(
    field: K,
    value: StudentPaymentFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

function formatDate(value: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function StudentPaymentForm({
  mode,
  values,
  errors,
  isSubmitting,
  lockStudent = false,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: StudentPaymentFormProps) {
  const studentsQuery = useStudentsQuery(
    mode === 'edit' ? {} : { status: 'active' },
  )
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
  const lockTransactionStatus = useIsRestrictedMarketing()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Transaction Details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Record a student payment with amount, status, and optional proof.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Student Name"
            htmlFor="studentId"
            error={errors.studentId}
            hint={lockStudent ? 'Student is fixed from the student profile.' : undefined}
          >
            <SearchableSelect
              id="studentId"
              value={values.studentId}
              options={studentOptions}
              onChange={(next) => onChange('studentId', next)}
              placeholder="Select student..."
              searchPlaceholder="Search students..."
              emptyMessage="No students found"
              disabled={studentsQuery.isLoading || lockStudent || mode === 'edit'}
            />
          </Field>

          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="Course Fee - SAT Intensive"
            />
          </Field>

          <Field label="Amount" htmlFor="amount" error={errors.amount}>
            <CurrencyInput
              id="amount"
              value={values.amount}
              onValueChange={(digits) => onChange('amount', digits)}
              placeholder="0"
            />
          </Field>

          <Field
            label="Transaction Status"
            htmlFor="status"
            error={errors.status}
            hint={
              lockTransactionStatus
                ? 'Marketing can view this status but cannot change it.'
                : undefined
            }
          >
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as StudentPaymentFormValues['status'],
                )
              }
              disabled={lockTransactionStatus}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="void">Void</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Description"
          htmlFor="description"
          error={errors.description}
        >
          <Textarea
            id="description"
            value={values.description}
            onChange={(event) => onChange('description', event.target.value)}
            placeholder="Optional notes about this transaction"
          />
        </Field>

        <div className="space-y-2">
          <Label htmlFor="paymentProof">Payment Proof</Label>
          <label
            htmlFor="paymentProof"
            className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-[#F4F6FA] px-4 text-sm text-slate-600 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF]"
          >
            <ImagePlus className="size-4 text-[#4274B9]" />
            <span className="flex-1 truncate">
              {values.hasPaymentProof
                ? 'Proof on file'
                : 'No proof attached yet'}
            </span>
            <input
              id="paymentProof"
              type="checkbox"
              className="size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
              checked={values.hasPaymentProof}
              onChange={(event) =>
                onChange('hasPaymentProof', event.target.checked)
              }
            />
          </label>
          <FieldError message={errors.hasPaymentProof} />
        </div>
      </section>

      {mode === 'edit' && meta ? (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-sm font-bold text-slate-900">Record Info</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Created by</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.createdBy}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Branch</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.branch}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">Transaction date</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatDate(meta.transactionDate)}
                </dd>
              </div>
            </dl>
          </section>
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
        <div>
          {mode === 'edit' && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              Delete Data
            </Button>
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
                : 'Updating...'
              : mode === 'create'
                ? 'Submit Data'
                : 'Update Data'}
          </Button>
        </div>
      </div>
    </form>
  )
}
