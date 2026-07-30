import { ImagePlus } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useProspectiveStudentOptionsQuery } from '../hooks/use-prospective-student-options-query'
import type {
  PredictionTestFormErrors,
  PredictionTestFormValues,
  PredictionTestListItem,
} from '../types/prediction-test'

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

type PredictionTestFormProps = {
  mode: 'create' | 'edit'
  values: PredictionTestFormValues
  errors: PredictionTestFormErrors
  isSubmitting: boolean
  meta?: Pick<
    PredictionTestListItem,
    | 'createdAt'
    | 'updatedAt'
    | 'studentName'
    | 'branch'
    | 'educationCounsellor'
    | 'paymentProofUrl'
  >
  onChange: <K extends keyof PredictionTestFormValues>(
    field: K,
    value: PredictionTestFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function PredictionTestForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: PredictionTestFormProps) {
  const studentsQuery = useProspectiveStudentOptionsQuery()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const proofLabel = values.paymentProofFile
    ? values.paymentProofFile.name
    : meta?.paymentProofUrl
      ? 'Current proof on file — click to replace'
      : 'Click to upload payment proof'

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Prediction Test Details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Record score, notes, and payment amount for a prospective student.
          </p>
        </div>

        {mode === 'create' ? (
          <Field
            label="Student"
            htmlFor="studentId"
            error={errors.studentId}
            hint="Select the prospective student for this prediction test."
          >
            <Select
              id="studentId"
              containerClassName="w-full sm:w-full"
              value={values.studentId}
              onChange={(event) => onChange('studentId', event.target.value)}
            >
              <option value="">Select student...</option>
              {(studentsQuery.data ?? []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} | {student.phone}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs text-slate-400">Student</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {meta?.studentName ?? '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {meta?.educationCounsellor
                ? `Counsellor: ${meta.educationCounsellor}`
                : null}
              {meta?.branch ? ` · ${meta.branch}` : null}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Score"
            htmlFor="score"
            error={errors.score}
            hint="Leave blank if the test has not been scored yet."
          >
            <Input
              id="score"
              inputMode="decimal"
              value={values.score}
              onChange={(event) => onChange('score', event.target.value)}
              placeholder="6.5"
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
            placeholder="Optional notes about this prediction test"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="status" error={errors.status}>
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as PredictionTestFormValues['status'],
                )
              }
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="void">Void</option>
            </Select>
          </Field>

          <div className="space-y-2">
            <Label htmlFor="paymentProof">Payment Proof</Label>
            <label
              htmlFor="paymentProof"
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-[#F4F6FA] px-4 text-sm text-slate-600 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF]"
            >
              <ImagePlus className="size-4 shrink-0 text-[#4274B9]" />
              <span className="flex-1 truncate">{proofLabel}</span>
              <input
                id="paymentProof"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) =>
                  onChange(
                    'paymentProofFile',
                    event.target.files?.[0] ?? null,
                  )
                }
              />
            </label>
            {meta?.paymentProofUrl && !values.paymentProofFile ? (
              <a
                href={meta.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-[#4274B9] hover:underline"
              >
                View current proof
              </a>
            ) : null}
            <FieldError message={errors.paymentProofFile} />
          </div>
        </div>
      </section>

      {mode === 'edit' && meta ? (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-sm font-bold text-slate-900">Record Info</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Date created</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatDateTime(meta.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Date updated</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatDateTime(meta.updatedAt)}
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
