import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import {
  newStudentBranchOptions,
  newStudentCounsellorOptions,
  newStudentCourseOptions,
} from '../data/new-students-placeholder'
import type {
  NewStudentFormErrors,
  NewStudentFormValues,
  NewStudentListItem,
} from '../types/new-student'

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

type NewStudentFormProps = {
  mode: 'create' | 'edit'
  values: NewStudentFormValues
  errors: NewStudentFormErrors
  isSubmitting: boolean
  meta?: Pick<NewStudentListItem, 'createdAt' | 'updatedAt'>
  onChange: <K extends keyof NewStudentFormValues>(
    field: K,
    value: NewStudentFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function NewStudentForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: NewStudentFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Lead Details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Capture a prospective student inquiry and assign a counsellor.
          </p>
        </div>

        <Field
          label="Education Counsellor"
          htmlFor="educationCounsellor"
          error={errors.educationCounsellor}
          hint="Select the marketing counsellor for this lead."
        >
          <Select
            id="educationCounsellor"
            containerClassName="w-full sm:w-full"
            value={values.educationCounsellor}
            onChange={(event) =>
              onChange('educationCounsellor', event.target.value)
            }
          >
            <option value="">Select counsellor...</option>
            {newStudentCounsellorOptions.map((option) => (
              <option key={option.id} value={option.fullName}>
                {option.fullName}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              value={values.fullName}
              onChange={(event) => onChange('fullName', event.target.value)}
              placeholder="Andrea Putri"
            />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              placeholder="andrea.putri@email.com"
            />
          </Field>

          <Field label="Gender" htmlFor="gender" error={errors.gender}>
            <Select
              id="gender"
              containerClassName="w-full sm:w-full"
              value={values.gender}
              onChange={(event) =>
                onChange(
                  'gender',
                  event.target.value as NewStudentFormValues['gender'],
                )
              }
            >
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>

          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              placeholder="081211122233"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course" htmlFor="course" error={errors.course}>
            <Select
              id="course"
              containerClassName="w-full sm:w-full"
              value={values.course}
              onChange={(event) => onChange('course', event.target.value)}
            >
              <option value="">Select course...</option>
              {newStudentCourseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status" htmlFor="status" error={errors.status}>
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as NewStudentFormValues['status'],
                )
              }
            >
              <option value="waiting">Waiting</option>
              <option value="follow_up">Follow Up</option>
              <option value="consult">Consult</option>
              <option value="prediction_test">Prediction Test</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>

          <Field label="Branch" htmlFor="branch" error={errors.branch}>
            <Select
              id="branch"
              containerClassName="w-full sm:w-full"
              value={values.branch}
              onChange={(event) => onChange('branch', event.target.value)}
            >
              {newStudentBranchOptions.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </Field>
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
