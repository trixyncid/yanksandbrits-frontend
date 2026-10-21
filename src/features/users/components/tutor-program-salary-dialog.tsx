import { Check, Plus, Search, Trash2, Wallet, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
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
import { cn } from '../../../shared/lib/cn'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { notify } from '../../../shared/lib/notify'
import { fetchPrograms } from '../../programs/api/programs-api'
import {
  bulkApplyTutorProgramSalaries,
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
  /** The tutor's current program rates; picking one adds to its current rate. */
  existingRates?: TutorProgramSalary[]
}

/** Blank stays blank; anything else becomes a whole, non-negative number. */
function toAmount(value: string) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0
}

export function TutorProgramSalaryDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
  salary,
  existingRates = [],
}: TutorProgramSalaryDialogProps) {
  const queryClient = useQueryClient()
  const isCreate = salary == null
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [values, setValues] = useState<TutorProgramSalaryFormValues>({
    salaryPerSession: '',
  })
  const [additional, setAdditional] = useState('')
  // The additional amount only shows once the user chooses to add to the rate.
  const [showAdditional, setShowAdditional] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const programsQuery = useQuery({
    queryKey: ['programs', 'list', 'program-salary-picker'],
    queryFn: () => fetchPrograms(),
    enabled: open && isCreate,
  })

  const ratesByProgram = useMemo(
    () =>
      new Map(
        existingRates
          .filter((rate) => rate.programId)
          .map((rate) => [rate.programId as string, rate]),
      ),
    [existingRates],
  )

  const programs = useMemo(
    () =>
      (programsQuery.data?.data ?? []).filter(
        (program) => program.isActive || ratesByProgram.has(program.id),
      ),
    [programsQuery.data?.data, ratesByProgram],
  )

  const visiblePrograms = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return programs
    return programs.filter((program) =>
      `${program.code} ${program.title}`.toLowerCase().includes(term),
    )
  }, [programs, search])

  // Reset the form whenever the dialog opens or switches to another salary.
  const [synced, setSynced] = useState<{
    open: boolean
    salary: TutorProgramSalary | null
  }>({ open: false, salary: null })
  if (synced.open !== open || synced.salary !== salary) {
    setSynced({ open, salary })
    if (open) {
      setIsSubmitting(false)
      setIsDeleting(false)
      setSelectedIds([])
      setSearch('')
      setAdditional('')
      setShowAdditional(false)
      setValues(isCreate ? { salaryPerSession: '' } : programSalaryToFormValues(salary))
    }
  }

  const additionalAmount = showAdditional ? toAmount(additional) : 0
  const enteredSalary = values.salaryPerSession.trim() === '' ? null : toAmount(values.salaryPerSession)
  const selectedNew = selectedIds.filter((id) => !ratesByProgram.has(id))
  const needsSalary = selectedNew.length > 0 && enteredSalary === null

  // What each selected program will be paid per session after saving.
  const preview = selectedIds.map((id) => {
    const program = programs.find((item) => item.id === id)
    const current = ratesByProgram.get(id)
    const base = current ? current.salaryPerSession : enteredSalary
    return {
      id,
      title: program?.title ?? current?.programTitle ?? 'Program',
      current: current?.salaryPerSession ?? null,
      next: base === null ? null : base + additionalAmount,
    }
  })

  function toggleProgram(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (isCreate) {
      if (selectedIds.length === 0) {
        notify('error', {
          title: 'Program required',
          description: 'Select at least one program.',
        })
        return
      }
      if (needsSalary) {
        notify('error', {
          title: 'Per-session rate required',
          description: 'Enter a per-session rate for programs that have no rate yet.',
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (isCreate) {
        const saved = await bulkApplyTutorProgramSalaries(tutorId, {
          programIds: selectedIds,
          salaryPerSession: enteredSalary,
          additionalAmount,
        })
        notify('success', {
          title: saved.length === 1 ? 'Program rate saved' : 'Program rates saved',
          description: `${saved.length} program rate${saved.length === 1 ? '' : 's'} for ${tutorName} saved.`,
        })
      } else if (salary) {
        await updateTutorProgramSalary(salary.id, salary.tutorId, salary.programId, {
          ...values,
          salaryPerSession: String(toAmount(values.salaryPerSession) + additionalAmount),
        })
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
        title: isCreate ? 'Unable to save program rates' : 'Unable to update program salary',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!salary || isDeleting) return

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

  const editNextRate = toAmount(values.salaryPerSession) + additionalAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="overflow-hidden p-0 sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-gradient-to-br from-brand-50 via-white to-white px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
              <Wallet className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {isCreate ? 'Program rates' : 'Program salary details'}
              </DialogTitle>
              <DialogDescription>
                {isCreate
                  ? `Pick one or more programs ${tutorName} is paid differently for. Programs that already have a rate are raised by the additional amount.`
                  : `Update the per-session fee for ${salary?.programTitle ?? 'this program'} (${tutorName}).`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
            {isCreate ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="program-salary-search">Programs</Label>
                  <span className="text-xs text-slate-500">
                    {selectedIds.length} selected
                  </span>
                </div>
                <div className="relative">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    id="program-salary-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search programs..."
                    className="pl-9"
                  />
                </div>
                <ul
                  role="listbox"
                  aria-multiselectable="true"
                  aria-label="Programs"
                  className="max-h-56 space-y-1 overflow-y-auto rounded-2xl bg-canvas/70 p-1.5"
                >
                  {programsQuery.isLoading ? (
                    <li className="px-3 py-2 text-xs text-slate-500">Loading programs…</li>
                  ) : visiblePrograms.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-slate-500">No programs found</li>
                  ) : (
                    visiblePrograms.map((program) => {
                      const checked = selectedIds.includes(program.id)
                      const current = ratesByProgram.get(program.id)
                      return (
                        <li key={program.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={checked}
                            onClick={() => toggleProgram(program.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition',
                              checked ? 'bg-white shadow-sm' : 'hover:bg-white/70',
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                'inline-flex size-4 shrink-0 items-center justify-center rounded border',
                                checked
                                  ? 'border-brand-500 bg-brand-500 text-white'
                                  : 'border-slate-300 bg-white',
                              )}
                            >
                              {checked ? <Check className="size-3" /> : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink">
                                {program.title}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {current
                                  ? `Current rate ${formatCurrencyAmount(current.salaryPerSession)}`
                                  : 'No rate yet'}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="program-salary-per-session">
                {isCreate ? 'Fee per session (for programs without a rate)' : 'Fee per session'}
              </Label>
              <CurrencyInput
                id="program-salary-per-session"
                value={values.salaryPerSession}
                onValueChange={(salaryPerSession) =>
                  setValues((current) => ({ ...current, salaryPerSession }))
                }
                placeholder="e.g. 150000"
              />
              {isCreate && needsSalary ? (
                <p className="text-xs text-rose-600">
                  Needed for {selectedNew.length} selected program
                  {selectedNew.length === 1 ? '' : 's'} without a rate.
                </p>
              ) : null}
            </div>

            {showAdditional ? (
              <div className="space-y-2 rounded-2xl bg-canvas/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="program-salary-additional">Additional amount</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdditional(false)
                      setAdditional('')
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-ink"
                  >
                    <X className="size-3.5" />
                    Remove
                  </button>
                </div>
                <CurrencyInput
                  id="program-salary-additional"
                  value={additional}
                  onValueChange={setAdditional}
                  placeholder="0"
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Added to the per-session rate and saved as the new rate. Overtime then
                  multiplies the new rate.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdditional(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
              >
                <Plus className="size-3.5" />
                Add to rate
              </button>
            )}

            <p className="text-xs text-slate-500">
              Overtime sessions use {tutorName}&apos;s base overtime multiplier on this fee.
            </p>

            {isCreate && preview.length > 0 ? (
              <div className="rounded-2xl bg-brand-50/70 p-3">
                <p className="text-xs font-semibold text-brand-800">New per-session rates</p>
                <ul className="mt-2 space-y-1">
                  {preview.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate text-slate-700">{row.title}</span>
                      <span className="shrink-0 tabular-nums text-ink">
                        {row.current != null ? (
                          <span className="text-slate-400">
                            {formatCurrencyAmount(row.current)} →{' '}
                          </span>
                        ) : null}
                        <span className="font-semibold">
                          {row.next == null ? 'Enter a rate' : formatCurrencyAmount(row.next)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!isCreate && additionalAmount > 0 ? (
              <p className="rounded-2xl bg-brand-50/70 px-3 py-2 text-xs text-brand-800">
                New per-session rate:{' '}
                <span className="font-semibold">{formatCurrencyAmount(editNextRate)}</span>
              </p>
            ) : null}
          </div>

          <DialogFooter className="mt-0 bg-canvas/70 px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              {!isCreate ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-rose-600 ring-0 hover:bg-rose-50 hover:text-rose-700"
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
                  variant="soft"
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
                    (isCreate && (selectedIds.length === 0 || needsSalary))
                  }
                >
                  {isCreate ? <Plus className="size-3.5" /> : <Wallet className="size-3.5" />}
                  {isSubmitting
                    ? 'Saving...'
                    : isCreate
                      ? selectedIds.length > 1
                        ? `Save ${selectedIds.length} rates`
                        : 'Save rate'
                      : 'Save rate'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
