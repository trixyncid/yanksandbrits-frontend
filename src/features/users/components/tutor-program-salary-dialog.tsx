import { Plus, Trash2, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
import { notify } from '../../../shared/lib/notify'
import { fetchPrograms } from '../../programs/api/programs-api'
import {
  createTutorProgramSalary,
  deleteTutorProgramSalary,
  programSalaryToFormValues,
  updateTutorProgramSalary,
  type TutorProgramSalary,
  type TutorProgramSalaryFormValues,
} from '../api/compensation-api'

type TutorProgramSalaryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutorId: string
  tutorName: string
  salary: TutorProgramSalary | null
  /** Program IDs that already have an override (excluded from create picker). */
  existingProgramIds?: string[]
}

export function TutorProgramSalaryDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
  salary,
  existingProgramIds = [],
}: TutorProgramSalaryDialogProps) {
  const queryClient = useQueryClient()
  const isCreate = salary == null
  const [programId, setProgramId] = useState('')
  const [values, setValues] = useState<TutorProgramSalaryFormValues>({
    salaryPerSession: '',
    overtimeMultiplier: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const programsQuery = useQuery({
    queryKey: ['programs', 'list', 'program-salary-picker'],
    queryFn: () => fetchPrograms(),
    enabled: open && isCreate,
  })

  const availablePrograms = useMemo(() => {
    const taken = new Set(existingProgramIds)
    return (programsQuery.data?.data ?? []).filter(
      (program) => program.isActive && !taken.has(program.id),
    )
  }, [existingProgramIds, programsQuery.data?.data])

  const programOptions = useMemo(
    () =>
      availablePrograms.map((program) => ({
        value: program.id,
        label: program.title,
        keywords: `${program.code} ${program.title}`,
      })),
    [availablePrograms],
  )
  useEffect(() => {
    if (!open) {
      return
    }
    setIsSubmitting(false)
    setIsDeleting(false)
    if (salary) {
      setProgramId(salary.programId ?? '')
      setValues(programSalaryToFormValues(salary))
      return
    }
    setProgramId('')
    setValues(programSalaryToFormValues(null))
  }, [open, salary])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextProgramId = isCreate ? programId : salary?.programId
    if (!nextProgramId) {
      notify('error', {
        title: 'Program required',
        description: 'Select a program for this salary override.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (isCreate) {
        const created = await createTutorProgramSalary(
          tutorId,
          nextProgramId,
          values,
        )
        notify('success', {
          title: 'Program salary added',
          description: `${created.programTitle ?? 'Program'} rates for ${tutorName} have been saved.`,
        })
      } else if (salary) {
        await updateTutorProgramSalary(
          salary.id,
          salary.tutorId,
          salary.programId,
          values,
        )
        notify('success', {
          title: 'Program salary updated',
          description: `${salary.programTitle ?? 'Program'} rates for ${tutorName} have been saved.`,
        })
      }

      await queryClient.invalidateQueries({
        queryKey: ['tutor-salary-class-based'],
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: isCreate
          ? 'Unable to add program salary'
          : 'Unable to update program salary',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!salary || isDeleting) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteTutorProgramSalary(salary.id)
      await queryClient.invalidateQueries({
        queryKey: ['tutor-salary-class-based'],
      })
      notify('success', {
        title: 'Program salary removed',
        description: `${salary.programTitle ?? 'Program'} will use the tutor's base rates.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: 'Unable to remove program salary',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]">
              <Wallet className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {isCreate ? 'Add program salary' : 'Program salary details'}
              </DialogTitle>
              <DialogDescription>
                {isCreate
                  ? `Only add a program when ${tutorName} is paid differently from their base rates.`
                  : `Update per-session and overtime rates for ${salary?.programTitle ?? 'this program'} (${tutorName}).`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            {isCreate ? (
              <div className="space-y-2">
                <Label htmlFor="program-salary-program">Program</Label>
                <SearchableSelect
                  id="program-salary-program"
                  value={programId}
                  options={programOptions}
                  onChange={setProgramId}
                  placeholder="Select program..."
                  searchPlaceholder="Search programs..."
                  emptyMessage="No programs found"
                  disabled={programsQuery.isLoading}
                />
                {programsQuery.isSuccess && availablePrograms.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Every active program already has an override for this tutor.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="program-salary-per-session">Per session</Label>
              <Input
                id="program-salary-per-session"
                inputMode="numeric"
                value={values.salaryPerSession}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    salaryPerSession: event.target.value,
                  }))
                }
                placeholder="e.g. 150000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program-overtime-multiplier">
                Overtime multiplier
              </Label>
              <Input
                id="program-overtime-multiplier"
                inputMode="decimal"
                value={values.overtimeMultiplier}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    overtimeMultiplier: event.target.value,
                  }))
                }
                placeholder="e.g. 1.5"
              />
            </div>
          </div>

          <DialogFooter className="mt-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              {!isCreate ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => void handleDelete()}
                  disabled={isSubmitting || isDeleting}
                >
                  <Trash2 className="size-3.5" />
                  {isDeleting ? 'Removing...' : 'Remove'}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isSubmitting ||
                    isDeleting ||
                    (isCreate && (!programId || availablePrograms.length === 0))
                  }
                >
                  {isCreate ? (
                    <Plus className="size-3.5" />
                  ) : (
                    <Wallet className="size-3.5" />
                  )}
                  {isSubmitting
                    ? 'Saving...'
                    : isCreate
                      ? 'Add override'
                      : 'Update'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
