import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import type {
  StudentResponseFormErrors,
  StudentResponseFormValues,
  StudentResponseListItem,
} from '../types/student-response'

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

type StudentResponseFormProps = {
  mode: 'create' | 'edit'
  values: StudentResponseFormValues
  errors: StudentResponseFormErrors
  isSubmitting: boolean
  meta?: Pick<StudentResponseListItem, 'createdAt'>
  onChange: <K extends keyof StudentResponseFormValues>(
    field: K,
    value: StudentResponseFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function StudentResponseForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: StudentResponseFormProps) {
  const studentsQuery = useStudentsQuery({ status: 'active' })
  const tutorsQuery = useTutorOptionsQuery()
  const students = studentsQuery.data?.data ?? []
  const tutors = tutorsQuery.data ?? []

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Response Details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Link a student and tutor, then capture the response notes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Student"
            htmlFor="studentId"
            error={errors.studentId}
            hint="Select the student for this response."
          >
            <Select
              id="studentId"
              containerClassName="w-full sm:w-full"
              value={values.studentId}
              onChange={(event) => onChange('studentId', event.target.value)}
              disabled={studentsQuery.isLoading}
            >
              <option value="">Select student...</option>
              {students.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.pin} | {option.fullName}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Tutor"
            htmlFor="tutorId"
            error={errors.tutorId}
            hint="Select the tutor responsible for this response."
          >
            <Select
              id="tutorId"
              containerClassName="w-full sm:w-full"
              value={values.tutorId}
              onChange={(event) => onChange('tutorId', event.target.value)}
              disabled={tutorsQuery.isLoading}
            >
              <option value="">Select tutor...</option>
              {tutors.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.pin} | {option.fullName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="Homework Feedback - Week 3"
            />
          </Field>

          <Field label="Status" htmlFor="status" error={errors.status}>
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as StudentResponseFormValues['status'],
                )
              }
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
            placeholder="Optional notes about this response"
          />
        </Field>
      </section>

      {mode === 'edit' && meta ? (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-sm font-bold text-slate-900">Record Info</h3>
            <div>
              <p className="text-xs text-slate-400">Date created</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatDateTime(meta.createdAt)}
              </p>
            </div>
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
