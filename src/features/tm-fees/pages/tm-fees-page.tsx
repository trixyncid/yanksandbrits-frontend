import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarRange,
  GraduationCap,
  Handshake,
  History,
  PhoneCall,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  ListErrorState,
  ListLoadingState,
  PageHero,
} from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'
import {
  formatCurrencyAmount,
  parseCurrencyValue,
} from '../../../shared/lib/currency'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { bookkeepingQueryKeys } from '../../bookkeeping/api/bookkeeping-query-keys'
import { marketingDashboardQueryKeys } from '../../marketing-dashboard/hooks/use-marketing-performance-query'
import {
  fetchTmFees,
  tmFeeQueryKeys,
  updateTmFees,
  type TmFeePeriod,
  type TmFees,
} from '../api/tm-fees-api'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
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

function periodLabel(period: TmFeePeriod) {
  return period.title || `${formatDate(period.startDate)} – ${formatDate(period.endDate)}`
}

export default function TmFeesPage() {
  const feesQuery = useQuery({
    queryKey: tmFeeQueryKeys.all,
    queryFn: fetchTmFees,
  })
  const fees = feesQuery.data
  const currentLabel = fees?.currentPeriods.map(periodLabel).join(', ')

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Money"
          title="TM fees"
          description="Flat fees education counsellors earn on telemarketing leads, and finance earns on new students. Changes apply to the bookkeeping period running now; earlier periods keep what they paid."
          theme="harbor"
          pattern="rings"
          stats={[
            {
              id: 'consult',
              label: 'TM - Consult',
              value: fees ? formatCurrencyAmount(fees.consultFee) : '–',
              icon: PhoneCall,
              caption: 'Per TM consult',
            },
            {
              id: 'deal',
              label: 'TM - Student Deal',
              value: fees ? formatCurrencyAmount(fees.studentDealFee) : '–',
              icon: Handshake,
              caption: 'Per same-period enrollment',
            },
            {
              id: 'finance',
              label: 'Finance - New Student',
              value: fees ? formatCurrencyAmount(fees.financeEnrollmentFee) : '–',
              icon: GraduationCap,
              caption: 'Per student enrolled in the period',
            },
            {
              id: 'period',
              label: 'Applies to',
              value: fees ? fees.currentPeriods.length || 'Next period' : '–',
              icon: CalendarRange,
              caption: currentLabel || 'No period is running today',
            },
          ]}
        />

        {feesQuery.isLoading ? <ListLoadingState rows={3} /> : null}

        {feesQuery.isError ? (
          <ListErrorState
            title="Unable to load TM fees"
            description={getApiErrorMessage(feesQuery.error)}
            onRetry={() => void feesQuery.refetch()}
          />
        ) : null}

        {fees ? (
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <TmFeesForm key={fees.updatedAt ?? 'initial'} fees={fees} />
            <PeriodHistory fees={fees} />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}

function TmFeesForm({ fees }: { fees: TmFees }) {
  const queryClient = useQueryClient()
  const [consult, setConsult] = useState(String(fees.consultFee))
  const [deal, setDeal] = useState(String(fees.studentDealFee))
  const [finance, setFinance] = useState(String(fees.financeEnrollmentFee))
  const [saving, setSaving] = useState(false)
  const changed =
    parseCurrencyValue(consult) !== fees.consultFee ||
    parseCurrencyValue(deal) !== fees.studentDealFee ||
    parseCurrencyValue(finance) !== fees.financeEnrollmentFee

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const updated = await updateTmFees({
        consultFee: parseCurrencyValue(consult),
        studentDealFee: parseCurrencyValue(deal),
        financeEnrollmentFee: parseCurrencyValue(finance),
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tmFeeQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: bookkeepingQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: marketingDashboardQueryKeys.all }),
      ])
      notify('success', {
        title: 'Fees updated',
        description: updated.currentPeriods.length
          ? `Counsellor and finance pay for ${updated.currentPeriods.map(periodLabel).join(', ')} has been recalculated.`
          : 'No period is running today; the next period will use these fees.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to update fees',
        description: getApiErrorMessage(error),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[1.75rem] bg-white p-5 sm:p-6"
    >
      <div>
        <h2 className="text-base font-bold text-ink">Fee amounts</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Saving recalculates education counsellor and finance pay for the
          period running now.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="consultFee">TM - Consult</Label>
          <CurrencyInput id="consultFee" value={consult} onValueChange={setConsult} />
          <p className="text-xs text-slate-400">Each telemarketing consult in the period.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="studentDealFee">TM - Student Deal</Label>
          <CurrencyInput id="studentDealFee" value={deal} onValueChange={setDeal} />
          <p className="text-xs text-slate-400">
            A consulted lead who enrolls in the same period.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="financeEnrollmentFee">Finance - New Student</Label>
          <CurrencyInput
            id="financeEnrollmentFee"
            value={finance}
            onValueChange={setFinance}
          />
          <p className="text-xs text-slate-400">
            Paid to each finance staff member for every prospective student who
            enrolls in the period.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {fees.updatedAt
            ? `Last changed ${formatDateTime(fees.updatedAt)}${fees.updatedBy ? ` by ${fees.updatedBy}` : ''}`
            : 'Not changed yet'}
        </p>
        <Button type="submit" variant="ink" size="sm" disabled={saving || !changed}>
          {saving ? 'Saving…' : 'Save fees'}
        </Button>
      </div>
    </form>
  )
}

function PeriodHistory({ fees }: { fees: TmFees }) {
  const currentIds = new Set(fees.currentPeriods.map((period) => period.id))

  return (
    <section className="rounded-[1.75rem] bg-white p-5">
      <div className="flex items-center gap-2">
        <History aria-hidden className="size-4 text-slate-400" />
        <h2 className="text-sm font-bold text-ink">What each period pays</h2>
      </div>
      {fees.periods.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">No bookkeeping periods yet.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {fees.periods.map((period) => {
            const isCurrent = currentIds.has(period.id)
            return (
              <li
                key={period.id}
                className={cn(
                  'rounded-2xl bg-canvas px-3.5 py-2.5',
                  isCurrent && 'ring-2 ring-brand-500/40',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-ink">
                    {periodLabel(period)}
                  </p>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {period.branchName || 'All branches'}
                </p>
                <p className="mt-1 text-xs text-slate-600 tabular-nums">
                  Consult {formatCurrencyAmount(period.consultFee)} · Deal{' '}
                  {formatCurrencyAmount(period.studentDealFee)} · Finance{' '}
                  {formatCurrencyAmount(period.financeEnrollmentFee)}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
