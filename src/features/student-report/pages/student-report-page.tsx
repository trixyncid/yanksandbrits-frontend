import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns'
import {
  Building2,
  CalendarRange,
  Check,
  FileDown,
  FileText,
  Loader2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { FormSectionCard } from '../../../shared/components/feature-page'
import { PageHero } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { downloadStudentRegistrationPdf } from '../api/student-report-api'

function formatPeriod(range: DateRange | undefined) {
  if (!range?.from || !range.to) {
    return 'Not selected'
  }
  return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`
}

/** Shortcuts that only fill in the date range picker. */
function periodPresets(today: Date) {
  const lastMonth = subMonths(today, 1)
  return [
    {
      id: 'this-month',
      label: 'This month',
      range: { from: startOfMonth(today), to: endOfMonth(today) },
    },
    {
      id: 'last-month',
      label: 'Last month',
      range: { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) },
    },
    {
      id: 'last-3-months',
      label: 'Last 3 months',
      range: { from: startOfMonth(subMonths(today, 2)), to: endOfMonth(today) },
    },
    {
      id: 'this-year',
      label: 'This year',
      range: { from: startOfYear(today), to: endOfYear(today) },
    },
  ]
}

function sameDay(first: Date | undefined, second: Date | undefined) {
  return Boolean(
    first && second && format(first, 'yyyy-MM-dd') === format(second, 'yyyy-MM-dd'),
  )
}

function StepChip({
  step,
  label,
  done,
}: {
  step: number
  label: string
  done: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs font-semibold backdrop-blur-md transition',
        done ? 'bg-white text-ink shadow-sm' : 'bg-white/55 text-slate-500',
      )}
    >
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full text-[11px]',
          done ? 'bg-brand-500 text-white' : 'bg-canvas text-slate-500',
        )}
      >
        {done ? <Check className="size-3.5" /> : step}
      </span>
      {label}
    </span>
  )
}

export default function StudentReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [chosenBranchId, setBranchId] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const branchesQuery = useBranchesQuery()
  const branches = useMemo(
    () => branchesQuery.data?.data ?? [],
    [branchesQuery.data?.data],
  )
  const presets = useMemo(() => periodPresets(new Date()), [])

  // Default to the first branch until one is chosen.
  const branchId = chosenBranchId || branches[0]?.id || ''

  const selectedBranchName = useMemo(() => {
    if (!branchId) {
      return 'Not selected'
    }
    return branches.find((branch) => branch.id === branchId)?.name ?? 'Not selected'
  }, [branchId, branches])

  const hasPeriod = Boolean(dateRange?.from && dateRange.to)
  const ready = Boolean(hasPeriod && branchId)

  async function handleDownload() {
    if (!dateRange?.from || !dateRange.to) {
      notify('warning', {
        title: 'Date range required',
        description: 'Please select both a start and end date.',
      })
      return
    }

    if (!branchId) {
      notify('warning', {
        title: 'Branch required',
        description: 'Please select a branch before downloading the report.',
      })
      return
    }

    setIsDownloading(true)
    try {
      await downloadStudentRegistrationPdf({
        branchId,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      })
      notify('success', {
        title: 'PDF downloaded',
        description: 'Student registration report has been saved.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to download report',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHero
          eyebrow="Reports"
          title="Student Report"
          description="Download a PDF of every student who registered at a branch during a period you choose."
          theme="mist"
          pattern="grid"
          compact
        >
          <div className="flex flex-wrap gap-2">
            <StepChip step={1} label="Choose a period" done={hasPeriod} />
            <StepChip step={2} label="Choose a branch" done={Boolean(branchId)} />
            <StepChip step={3} label="Download the PDF" done={false} />
          </div>
        </PageHero>

        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            <FormSectionCard
              icon={CalendarRange}
              title="Registration period"
              description="Students whose registration date falls inside this range are included."
            >
              <div className="space-y-1.5">
                <Label htmlFor="student-report-date-range">
                  Date range <span className="text-rose-500">*</span>
                </Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full min-w-0"
                  placeholder="Select start and end dates"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">
                  Quick pick
                </p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => {
                    const selected =
                      sameDay(dateRange?.from, preset.range.from) &&
                      sameDay(dateRange?.to, preset.range.to)
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDateRange(preset.range)}
                        className={cn(
                          'h-9 rounded-full px-4 text-sm font-semibold transition',
                          selected
                            ? 'bg-ink text-white'
                            : 'bg-canvas text-slate-600 hover:bg-canvas-deep hover:text-ink',
                        )}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </FormSectionCard>

            <FormSectionCard
              icon={Building2}
              title="Branch"
              description="The report covers one branch at a time."
              delayClassName="delay-75"
            >
              <div className="space-y-1.5">
                <p
                  id="student-report-branch-label"
                  className="text-sm font-medium text-slate-700"
                >
                  Branch <span className="text-rose-500">*</span>
                </p>
                {branchesQuery.isLoading ? (
                  <div className="grid gap-2 sm:grid-cols-2" aria-busy="true">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-12 animate-pulse rounded-2xl bg-canvas"
                      />
                    ))}
                  </div>
                ) : branches.length === 0 ? (
                  <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-slate-500">
                    No branches available yet.
                  </p>
                ) : (
                  <div
                    role="radiogroup"
                    aria-labelledby="student-report-branch-label"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {branches.map((branch) => {
                      const selected = branch.id === branchId
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setBranchId(branch.id)}
                          className={cn(
                            'flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold transition',
                            selected
                              ? 'bg-ink text-white shadow-sm'
                              : 'bg-canvas text-slate-700 hover:bg-canvas-deep hover:text-ink',
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                              selected
                                ? 'bg-white/15 text-white'
                                : 'bg-white text-brand-600',
                            )}
                          >
                            {selected ? (
                              <Check className="size-4" />
                            ) : (
                              <Building2 className="size-4" />
                            )}
                          </span>
                          <span className="min-w-0 truncate">{branch.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </FormSectionCard>
          </div>

          <aside className="animate-in fade-in slide-in-from-bottom-2 space-y-4 rounded-[1.75rem] bg-white p-5 delay-100 sm:p-6 lg:sticky lg:top-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors',
                  ready ? 'bg-brand-500 text-white' : 'bg-canvas text-brand-600',
                )}
              >
                <FileText className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold tracking-tight text-ink">
                  {ready ? 'Ready to download' : 'Almost there'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ready
                    ? 'Check the details below, then download the PDF.'
                    : 'Choose a period and a branch to unlock the download.'}
                </p>
              </div>
            </div>

            <dl className="grid gap-2">
              <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                <dt className="text-xs text-slate-500">Period</dt>
                <dd
                  className={cn(
                    'mt-0.5 text-sm font-semibold',
                    hasPeriod ? 'text-ink' : 'text-slate-400',
                  )}
                >
                  {formatPeriod(dateRange)}
                </dd>
              </div>
              <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                <dt className="text-xs text-slate-500">Branch</dt>
                <dd
                  className={cn(
                    'mt-0.5 text-sm font-semibold',
                    branchId ? 'text-ink' : 'text-slate-400',
                  )}
                >
                  {selectedBranchName}
                </dd>
              </div>
            </dl>

            <div className="space-y-2">
              <Button
                fullWidth
                size="lg"
                disabled={!ready || isDownloading}
                onClick={() => void handleDownload()}
              >
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                {isDownloading ? 'Preparing PDF…' : 'Download PDF'}
              </Button>
              <p className="text-center text-[11px] text-slate-400">
                The PDF saves to your device. Longer periods may take a
                moment.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
