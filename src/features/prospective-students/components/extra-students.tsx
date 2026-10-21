import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus, Trash2, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { COURSE_OPTIONS } from '../../../shared/api/choices'
import { FormSectionCard } from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { notify } from '../../../shared/lib/notify'
import { predictionTestQueryKeys } from '../../prediction-tests/api/prediction-test-query-keys'
import { addStudentToResponse } from '../api/prospective-students-api'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'
import { emptyExtraStudent, validateExtraStudent } from '../lib/extra-students'
import type {
  ExtraStudentErrors,
  ExtraStudentValues,
  ProspectiveStudentStatus,
} from '../types/prospective-student'
import { LeadStatusPill } from './lead-status-pill'
import { Field, SegmentedChoice } from './prospective-student-form'

/** Personal details for one student who shares a response. */
function ExtraStudentFields({
  student,
  errors,
  onChange,
}: {
  student: ExtraStudentValues
  errors: ExtraStudentErrors
  onChange: <K extends keyof ExtraStudentValues>(field: K, value: ExtraStudentValues[K]) => void
}) {
  const id = (field: string) => `${student.key}-${field}`
  return (
    <div className="space-y-3">
      <Field label="Full name" htmlFor={id('fullName')} error={errors.fullName} required>
        <Input
          id={id('fullName')}
          value={student.fullName}
          onChange={(event) => onChange('fullName', event.target.value)}
          placeholder="Bima Putra"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone" htmlFor={id('phone')} error={errors.phone} required>
          <Input
            id={id('phone')}
            value={student.phone}
            onChange={(event) => onChange('phone', event.target.value)}
          />
        </Field>
        <Field label="Email" htmlFor={id('email')} error={errors.email}>
          <Input
            id={id('email')}
            type="email"
            value={student.email}
            onChange={(event) => onChange('email', event.target.value)}
          />
        </Field>
        <Field label="Gender" htmlFor={id('gender')} error={errors.gender} required>
          <SegmentedChoice
            id={id('gender')}
            label="Gender"
            value={student.gender}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            onChange={(next) => onChange('gender', next)}
          />
        </Field>
        <Field label="Age" htmlFor={id('age')} error={errors.age} required>
          <Input
            id={id('age')}
            inputMode="numeric"
            value={student.age}
            onChange={(event) => onChange('age', event.target.value)}
          />
        </Field>
        <Field label="Prediction test" htmlFor={id('course')} error={errors.course} required>
          <Select
            id={id('course')}
            containerClassName="w-full sm:w-full"
            value={student.course}
            onChange={(event) =>
              onChange('course', event.target.value as ExtraStudentValues['course'])
            }
          >
            <option value="">Select prediction test...</option>
            {COURSE_OPTIONS.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor={id('status')} error={errors.status}>
          <Select
            id={id('status')}
            containerClassName="w-full sm:w-full"
            value={student.status}
            onChange={(event) =>
              onChange('status', event.target.value as ExtraStudentValues['status'])
            }
          >
            <option value="consult">Consult</option>
            <option value="prediction_test">Pre-Test</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        <Field label="SR number" htmlFor={id('srNumber')} error={errors.srNumber} required>
          <Input
            id={id('srNumber')}
            value={student.srNumber}
            onChange={(event) => onChange('srNumber', event.target.value)}
          />
        </Field>
      </div>
      <Field label="Address" htmlFor={id('address')} error={errors.address} required>
        <Textarea
          id={id('address')}
          value={student.address}
          onChange={(event) => onChange('address', event.target.value)}
        />
      </Field>
    </div>
  )
}

/** Create form: more students in the same response, sharing student 1's Consult & Source. */
export function ExtraStudentsSection({
  students,
  errors,
  onAdd,
  onRemove,
  onChange,
}: {
  students: ExtraStudentValues[]
  errors: Record<string, ExtraStudentErrors>
  onAdd: () => void
  onRemove: (key: string) => void
  onChange: <K extends keyof ExtraStudentValues>(
    key: string,
    field: K,
    value: ExtraStudentValues[K],
  ) => void
}) {
  return (
    <FormSectionCard
      icon={Users}
      title="More students in this response"
      description="Siblings or friends who came in together. They share this response's Consult & Source, enroll and take prediction tests on their own, and the response counts once for the counsellor."
    >
      <div className="space-y-3">
        {students.map((student, index) => (
          // White card so the (canvas-coloured) inputs stand out, as in the main form.
          <div
            key={student.key}
            className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-2 border-b border-violet-100 bg-violet-50/70 px-4 py-2.5">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-violet-900">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white">
                  {index + 2}
                </span>
                Student {index + 2}
              </p>
              <button
                type="button"
                onClick={() => onRemove(student.key)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            </div>
            <div className="p-4">
              <ExtraStudentFields
                student={student}
                errors={errors[student.key] ?? {}}
                onChange={(field, value) => onChange(student.key, field, value)}
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="soft" size="sm" onClick={onAdd}>
          <Plus className="size-3.5" />
          Add another student
        </Button>
      </div>
    </FormSectionCard>
  )
}

/** Edit page: add one more student to an existing response. */
export function AddStudentToResponseDialog({
  open,
  onOpenChange,
  responseId,
  defaults,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  responseId: string
  defaults: Pick<ExtraStudentValues, 'phone' | 'address'>
}) {
  const queryClient = useQueryClient()
  const [student, setStudent] = useState<ExtraStudentValues>(() => emptyExtraStudent(defaults))
  const [errors, setErrors] = useState<ExtraStudentErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStudent(emptyExtraStudent(defaults))
      setErrors({})
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateExtraStudent(student)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || isSaving) return
    setIsSaving(true)
    try {
      const created = await addStudentToResponse(responseId, student)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: prospectiveStudentQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: predictionTestQueryKeys.all }),
      ])
      notify('success', {
        title: 'Student added',
        description: `${created.fullName} was added to this student response.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', { title: 'Unable to add student', description: getApiErrorMessage(error) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a student to this response</DialogTitle>
            <DialogDescription>
              They share this response&apos;s Consult &amp; Source details. The response still
              counts once for the counsellor.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5">
            <ExtraStudentFields
              student={student}
              errors={errors}
              onChange={(field, value) => {
                setStudent((current) => ({ ...current, [field]: value }))
                setErrors((current) => ({ ...current, [field]: undefined }))
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="soft" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Adding...' : 'Add student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Edit page: everyone in this student's response, with a way to add one more. */
export function ResponseStudentsPanel({
  currentId,
  responseId,
  students,
  defaults,
}: {
  currentId: string
  responseId: string | null
  students: { id: string; fullName: string; status: string }[]
  defaults: Pick<ExtraStudentValues, 'phone' | 'address'>
}) {
  const [adding, setAdding] = useState(false)
  if (!responseId) return null
  const others = students.filter((student) => student.id !== currentId)

  return (
    <FormSectionCard
      icon={Users}
      title="Students in this response"
      description={
        others.length > 0
          ? 'Changing Consult & Source here updates everyone in this response. Each student keeps their own details, prediction test and enrollment.'
          : 'Add a sibling or friend who came in with this student. They share the Consult & Source below, and the response counts once for the counsellor.'
      }
    >
      <div className="space-y-2">
        {others.length > 0 ? (
          <ul className="space-y-1.5">
            {others.map((student) => (
              <li key={student.id}>
                <Link
                  to="/prospective-students/$prospectiveStudentId/edit"
                  params={{ prospectiveStudentId: student.id }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas"
                >
                  <span className="min-w-0 truncate">{student.fullName}</span>
                  <LeadStatusPill status={student.status as ProspectiveStudentStatus} />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <Button type="button" variant="soft" size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-3.5" />
          Add student
        </Button>
      </div>
      <AddStudentToResponseDialog
        open={adding}
        onOpenChange={setAdding}
        responseId={responseId}
        defaults={defaults}
      />
    </FormSectionCard>
  )
}
