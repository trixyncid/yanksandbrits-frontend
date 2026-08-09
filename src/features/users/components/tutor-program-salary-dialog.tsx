import { Wallet } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
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
import { notify } from '../../../shared/lib/notify'
import {
  programSalaryToFormValues,
  updateTutorProgramSalary,
  type TutorProgramSalary,
  type TutorProgramSalaryFormValues,
} from '../api/compensation-api'

type TutorProgramSalaryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutorName: string
  salary: TutorProgramSalary | null
}

export function TutorProgramSalaryDialog({
  open,
  onOpenChange,
  tutorName,
  salary,
}: TutorProgramSalaryDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<TutorProgramSalaryFormValues>({
    salaryPerSession: '0',
    overtimeMultiplier: '0',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && salary) {
      setValues(programSalaryToFormValues(salary))
      setIsSubmitting(false)
    }
  }, [open, salary])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!salary || isSubmitting) return

    setIsSubmitting(true)
    try {
      await updateTutorProgramSalary(
        salary.id,
        salary.tutorId,
        salary.programId,
        values,
      )

      await queryClient.invalidateQueries({
        queryKey: ['tutor-salary-class-based'],
      })

      notify('success', {
        title: 'Program salary updated',
        description: `${salary.programTitle ?? 'Program'} rates for ${tutorName} have been saved.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: 'Unable to update program salary',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-[linear-gradient(135deg,#EDF4FF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9] ring-1 ring-[#BED2F2]">
              <Wallet className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>Program salary details</DialogTitle>
              <DialogDescription>
                Update per-session and overtime rates for{' '}
                {salary?.programTitle ?? 'this program'} ({tutorName}).
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
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
              />
            </div>
          </div>

          <DialogFooter className="mt-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !salary}>
              <Wallet className="size-3.5" />
              {isSubmitting ? 'Saving...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
