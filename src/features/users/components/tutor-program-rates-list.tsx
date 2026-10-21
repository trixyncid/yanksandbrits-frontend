import { useQueryClient } from '@tanstack/react-query'
import { Check, Eye, Minus, Plus, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'

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
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { useModulePermissions } from '../../auth/hooks/use-permissions'
import {
  bulkApplyTutorProgramSalaries,
  deleteTutorProgramSalaries,
  type TutorProgramSalary,
} from '../api/compensation-api'
import { formatStaffCurrency } from './staff-detail-utils'

function SelectBox({
  state,
  label,
  onToggle,
}: {
  state: 'on' | 'off' | 'some'
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'some' ? 'mixed' : state === 'on'}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition',
        state === 'off'
          ? 'border-slate-300 bg-white hover:border-brand-500'
          : 'border-brand-500 bg-brand-500 text-white',
      )}
    >
      {state === 'on' ? <Check className="size-3.5" /> : null}
      {state === 'some' ? <Minus className="size-3.5" /> : null}
    </button>
  )
}

/** A tutor's program rates, with multi-select to raise or remove several at once. */
export function TutorProgramRatesList({
  rates,
  tutorId,
  tutorName,
  onOpen,
}: {
  rates: TutorProgramSalary[]
  tutorId: string
  tutorName: string
  onOpen: (rate: TutorProgramSalary) => void
}) {
  const queryClient = useQueryClient()
  const { canChange, canDelete } = useModulePermissions('users')
  const canSelect = canChange || canDelete
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [raiseOpen, setRaiseOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  // Drop selections for rates that no longer exist (e.g. after removing them).
  const liveIds = new Set(rates.map((rate) => rate.id))
  const selected = selectedIds.filter((id) => liveIds.has(id))
  const selectedRates = rates.filter((rate) => selected.includes(rate.id))
  const allState = selected.length === 0 ? 'off' : selected.length === rates.length ? 'on' : 'some'
  const raiseBy = Number(amount) || 0

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function toggleAll() {
    setSelectedIds(allState === 'on' ? [] : rates.map((rate) => rate.id))
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['tutor-salary-class-based'] })
  }

  async function raiseSelected(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (raiseBy <= 0 || isWorking) return
    setIsWorking(true)
    try {
      await bulkApplyTutorProgramSalaries(tutorId, {
        programIds: selectedRates.flatMap((rate) => (rate.programId ? [rate.programId] : [])),
        salaryPerSession: null,
        additionalAmount: raiseBy,
      })
      await refresh()
      notify('success', {
        title: 'Program rates raised',
        description: `${selectedRates.length} rate${selectedRates.length === 1 ? '' : 's'} for ${tutorName} raised by ${formatCurrencyAmount(raiseBy)}.`,
      })
      setRaiseOpen(false)
      setSelectedIds([])
    } catch (error) {
      notify('error', { title: 'Unable to raise rates', description: getApiErrorMessage(error) })
    } finally {
      setIsWorking(false)
    }
  }

  function removeSelected() {
    const count = selectedRates.length
    requestDeleteConfirm({
      title: `Remove ${count} program rate${count === 1 ? '' : 's'}?`,
      description: `${selectedRates.map((rate) => rate.programTitle ?? 'Program').join(', ')} will go back to using ${tutorName}'s base rates. This cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteTutorProgramSalaries(selectedRates.map((rate) => rate.id))
            await refresh()
            setSelectedIds([])
            notify('success', {
              title: 'Program rates removed',
              description: `${count} program${count === 1 ? '' : 's'} will use the tutor's base rates.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to remove program rates',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <div className="space-y-2">
      {canSelect ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2',
            selected.length > 0 ? 'bg-ink text-white' : 'bg-transparent',
          )}
        >
          <label className="flex items-center gap-2.5 text-xs font-semibold">
            <SelectBox state={allState} label="Select all program rates" onToggle={toggleAll} />
            {selected.length > 0 ? `${selected.length} selected` : 'Select all'}
          </label>
          {selected.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {canChange ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-white text-ink ring-0 hover:bg-brand-50"
                  onClick={() => {
                    setAmount('')
                    setRaiseOpen(true)
                  }}
                >
                  <Plus className="size-3.5" />
                  Add to rate
                </Button>
              ) : null}
              {canDelete ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-white text-rose-600 ring-0 hover:bg-rose-50"
                  onClick={removeSelected}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
              <button
                type="button"
                aria-label="Clear selection"
                onClick={() => setSelectedIds([])}
                className="inline-flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <ul className="space-y-2">
        {rates.map((rate) => {
          const isSelected = selected.includes(rate.id)
          return (
            <li
              key={rate.id}
              className={cn(
                'flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 transition',
                isSelected ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-canvas',
              )}
            >
              {canSelect ? (
                <SelectBox
                  state={isSelected ? 'on' : 'off'}
                  label={`Select ${rate.programTitle ?? 'program'} rate`}
                  onToggle={() => toggle(rate.id)}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{rate.programTitle || '—'}</p>
                <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                  {formatStaffCurrency(rate.salaryPerSession)} per session · base overtime
                  multiplier
                </p>
              </div>
              {canChange ? (
                <button
                  type="button"
                  aria-label={`Open program rate for ${rate.programTitle ?? 'program'}`}
                  title="Open details"
                  onClick={() => onOpen(rate)}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white text-ink transition hover:bg-ink hover:text-white"
                >
                  <Eye className="size-3.5" />
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>

      <Dialog open={raiseOpen} onOpenChange={(open) => !isWorking && setRaiseOpen(open)}>
        <DialogContent className="max-w-sm">
          <form onSubmit={raiseSelected} noValidate>
            <DialogHeader>
              <DialogTitle>Add to {selectedRates.length} rate{selectedRates.length === 1 ? '' : 's'}</DialogTitle>
              <DialogDescription>
                Each selected program&apos;s fee per session goes up by this amount and is saved
                as its new rate.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="raise-program-rates">Additional amount (IDR)</Label>
              <CurrencyInput
                id="raise-program-rates"
                value={amount}
                onValueChange={setAmount}
                placeholder="0"
                autoFocus
              />
            </div>
            {raiseBy > 0 ? (
              <ul className="mt-3 space-y-1 rounded-2xl bg-brand-50/70 p-3 text-xs">
                {selectedRates.map((rate) => (
                  <li key={rate.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-slate-700">{rate.programTitle}</span>
                    <span className="shrink-0 tabular-nums">
                      <span className="text-slate-400">
                        {formatCurrencyAmount(rate.salaryPerSession)} →{' '}
                      </span>
                      <span className="font-semibold text-ink">
                        {formatCurrencyAmount(rate.salaryPerSession + raiseBy)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="soft"
                disabled={isWorking}
                onClick={() => setRaiseOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isWorking || raiseBy <= 0}>
                {isWorking ? 'Saving...' : 'Add to rates'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
