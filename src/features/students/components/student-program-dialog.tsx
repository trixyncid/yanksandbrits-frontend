import { BookOpen } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../../../shared/api/errors'
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
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { notify } from '../../../shared/lib/notify'
import { useProgramsQuery } from '../../programs/hooks/use-programs-query'
import {
  createStudentProgram,
  emptyStudentProgramFormValues,
  studentProgramToFormValues,
  updateStudentProgram,
} from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import type {
  StudentProgramFormValues,
  StudentProgramItem,
  StudentProgramStatus,
} from '../types/student'

const STATUS_OPTIONS: { value: StudentProgramStatus; label: string }[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

type StudentProgramDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
  enrollment: StudentProgramItem | null
}

export function StudentProgramDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  enrollment,
}: StudentProgramDialogProps) {
  const queryClient = useQueryClient()
  const programsQuery = useProgramsQuery({ isActive: 'active' })
  const [values, setValues] = useState<StudentProgramFormValues>(
    emptyStudentProgramFormValues,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isUpdate = Boolean(enrollment)

  const programOptions = useMemo(() => {
    const options = (programsQuery.data?.data ?? []).map((program) => ({
      value: program.id,
      label: `${program.code} · ${program.title}`,
      keywords: `${program.code} ${program.title} ${program.description}`,
    }))

    if (
      enrollment &&
      !options.some((option) => option.value === enrollment.programId)
    ) {
      options.unshift({
        value: enrollment.programId,
        label: enrollment.code
          ? `${enrollment.code} · ${enrollment.title}`
          : enrollment.title,
        keywords: `${enrollment.code} ${enrollment.title}`,
      })
    }

    return options
  }, [enrollment, programsQuery.data?.data])

  // Reset the form whenever the dialog opens or its enrollment changes.
  const [synced, setSynced] = useState<{
    open: boolean
    enrollment: typeof enrollment
  } | null>(null)
  if (synced?.open !== open || synced.enrollment !== enrollment) {
    setSynced({ open, enrollment })
    if (open) {
      setValues(
        enrollment
          ? studentProgramToFormValues(enrollment)
          : emptyStudentProgramFormValues,
      )
      setIsSubmitting(false)
    }
  }

  function updateField<K extends keyof StudentProgramFormValues>(
    field: K,
    value: StudentProgramFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!values.programId) {
      notify('error', {
        title: isUpdate ? 'Unable to update program' : 'Unable to add program',
        description: 'Select a program to continue.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (enrollment) {
        await updateStudentProgram(enrollment.id, studentId, values)
      } else {
        await createStudentProgram(studentId, values)
      }

      await queryClient.invalidateQueries({
        queryKey: studentQueryKeys.detail(studentId),
      })

      notify('success', {
        title: isUpdate ? 'Program updated' : 'Program added',
        description: `Enrollment for ${studentName} has been saved.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: isUpdate ? 'Unable to update program' : 'Unable to add program',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-lg"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex max-h-[90vh] flex-col"
        >
          <div className="shrink-0 bg-canvas px-6 pt-6 pb-4">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-500 text-white">
              <BookOpen className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {isUpdate
                  ? enrollment?.title ?? 'Program enrollment'
                  : 'Add program'}
              </DialogTitle>
              <DialogDescription>
                {isUpdate
                  ? `Update ${enrollment?.title ?? 'this program'} for ${studentName}.`
                  : `Enroll ${studentName} in a program.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {enrollment ? (
              <div className="rounded-3xl bg-canvas p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Session progress</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {enrollment.sessionsUsed} used of {enrollment.sessions}{' '}
                      sessions
                    </p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-brand-700">
                    {Math.max(0, Math.min(100, enrollment.progressPercentage))}%
                  </p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, enrollment.progressPercentage))}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="student-program-id">
                Program<span className="text-rose-500"> *</span>
              </Label>
              <SearchableSelect
                id="student-program-id"
                value={values.programId}
                options={programOptions}
                onChange={(value) => updateField('programId', value)}
                placeholder="Select program"
                searchPlaceholder="Search programs..."
                emptyMessage="No programs found"
              />
              <p className="text-xs text-slate-400">
                Only active programs are listed.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="student-program-sessions">Sessions</Label>
                <Input
                  id="student-program-sessions"
                  inputMode="numeric"
                  value={values.sessions}
                  onChange={(event) =>
                    updateField('sessions', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-program-period">
                  Period (months)
                </Label>
                <Input
                  id="student-program-period"
                  inputMode="numeric"
                  placeholder="e.g. 6"
                  value={values.period}
                  onChange={(event) =>
                    updateField('period', event.target.value)
                  }
                />
                <p className="text-xs text-slate-400">
                  How many months this program runs.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-program-status">Status</Label>
              <Select
                id="student-program-status"
                containerClassName="w-full sm:w-full"
                value={values.status}
                onChange={(event) =>
                  updateField(
                    'status',
                    event.target.value as StudentProgramStatus,
                  )
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-program-description">Description</Label>
              <Textarea
                id="student-program-description"
                value={values.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                placeholder="Optional notes for this enrollment"
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 px-6 py-4">
            <Button
              type="button"
              variant="soft"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <BookOpen className="size-3.5" />
              {isSubmitting
                ? 'Saving...'
                : isUpdate
                  ? 'Save changes'
                  : 'Add program'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
