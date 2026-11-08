import { BarChart3, Filter, GraduationCap, History, Megaphone, Wallet } from 'lucide-react'

import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import { DashboardColumnChart } from '../../admin/components/dashboard-charts'
import {
  DashboardChip,
  DashboardDelta,
  DashboardStackedBar,
  DashboardSwatch,
} from '../../admin/components/dashboard-kit'
import { BRAND_CHART } from '../../admin/components/dashboard-palette'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type { DigitalMarketingPerformanceMetrics } from '../types/digital-marketing-dashboard'

type CardProps = { metrics: DigitalMarketingPerformanceMetrics; className?: string }

function plural(count: number, word: string) {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function rate(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : null
}

export function DigitalMarketingPayCard({ metrics, className }: CardProps) {
  const { earnings, kpis } = metrics
  const rows = [
    {
      label: 'Base salary',
      amount: earnings.mainSalary,
      hint: null as string | null,
      accent: BRAND_CHART.brand900,
    },
    {
      label: 'New student commission',
      amount: earnings.commissionSalary,
      hint: `${plural(earnings.enrollmentCount, 'new student')} × ${formatCurrencyAmount(earnings.commissionFee)}`,
      accent: BRAND_CHART.brand400,
    },
  ]

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="How your pay adds up"
        description={
          earnings.isSaved
            ? 'Saved when this bookkeeping period was approved.'
            : 'Estimated so far. It updates as new students enroll.'
        }
        icon={<Wallet className="size-4" />}
        action={
          <DashboardChip tone="ink">
            {formatCurrencyAmount(earnings.expectedSalary)}
          </DashboardChip>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <DashboardChip icon={History}>
          Last period {formatCurrencyCompact(kpis.expectedPay.previous)}
        </DashboardChip>
        <DashboardDelta changePct={kpis.expectedPay.changePct} />
      </div>

      <DashboardStackedBar
        segments={rows.map((row) => ({
          label: row.label,
          value: Math.max(row.amount, 0),
          color: row.accent,
        }))}
        formatValue={formatCurrencyAmount}
      />

      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 rounded-3xl bg-canvas/70 px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <DashboardSwatch color={row.accent} className="mt-1.5" />
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-ink">{row.label}</dt>
                {row.hint ? (
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">{row.hint}</p>
                ) : null}
              </div>
            </div>
            <dd className="shrink-0 text-sm font-bold text-ink tabular-nums">
              {formatCurrencyAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>

      {earnings.isSaved && earnings.enrollmentCount !== kpis.newStudents.current ? (
        <p className="mt-3 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs leading-snug text-amber-900">
          Pay was saved for {plural(earnings.enrollmentCount, 'new student')}, but{' '}
          {plural(kpis.newStudents.current, 'student')} enrolled in this period. Students
          may have been added after the period was approved.
        </p>
      ) : null}
    </DashboardPanel>
  )
}

export function DigitalMarketingEnrollmentTrend({ metrics, className }: CardProps) {
  const data = metrics.enrollmentTrend.map((week) => ({
    label: week.label.replace(/–.*/, '').trim(),
    value: week.enrollments,
  }))
  const hasEnrollments = data.some((week) => week.value > 0)
  let peak = 0
  data.forEach((week, index) => {
    if (week.value >= data[peak].value) peak = index
  })

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="New students each week"
        description="Students from your sources who enrolled. Each one earns you commission."
        icon={<BarChart3 className="size-4" />}
        action={
          hasEnrollments ? (
            <DashboardChip tone="brand">
              Busiest {data[peak]?.label}: {data[peak]?.value}
            </DashboardChip>
          ) : null
        }
      />
      <div className="flex flex-1 flex-col justify-end">
        {hasEnrollments ? (
          <DashboardColumnChart
            data={data}
            highlightIndex={peak}
            showValueOnHighlight
            className="min-h-[220px]"
          />
        ) : (
          <DashboardEmptyState message="No new students yet this period. Enrollments show up here week by week." />
        )}
      </div>
    </DashboardPanel>
  )
}

export function DigitalMarketingFunnelCard({ metrics, className }: CardProps) {
  const { funnel } = metrics
  const max = Math.max(funnel.leads, funnel.consulted, funnel.enrolled, 1)
  const stages = [
    { label: 'Leads', value: funnel.leads, note: 'New responses', tone: 'bg-brand-900' },
    {
      label: 'Consulted',
      value: funnel.consulted,
      note: rate(funnel.consulted, funnel.leads),
      tone: 'bg-brand-600',
    },
    {
      label: 'Enrolled',
      value: funnel.enrolled,
      note: rate(funnel.enrolled, funnel.consulted),
      tone: 'bg-brand-400',
    },
  ]

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Your funnel"
        description="Each stage counts what happened in this period, so a lead from last period can still consult or enroll now."
        icon={<Filter className="size-4" />}
      />
      <ol className="flex flex-1 flex-col justify-center gap-2">
        {stages.map((stage, index) => (
          <li key={stage.label} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'flex h-11 items-center justify-between gap-2 rounded-full px-4 text-white transition-all duration-700 ease-out',
                  stage.tone,
                )}
                // Wide enough at zero for the label and count on a phone.
                style={{ width: `${60 + (stage.value / max) * 40}%` }}
              >
                <span className="truncate text-xs font-semibold">{stage.label}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {stage.value.toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <span className="w-24 shrink-0 text-right text-[11px] leading-tight text-slate-500">
              {index === 0
                ? stage.note
                : stage.note == null
                  ? '–'
                  : `${stage.note}% of ${stages[index - 1].label.toLowerCase()}`}
            </span>
          </li>
        ))}
      </ol>
    </DashboardPanel>
  )
}

export function DigitalMarketingSourcesCard({ metrics, className }: CardProps) {
  const { sources, trackedSources } = metrics

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Lead sources"
        description="Only sources marked for Digital Marketing count toward your commission."
        icon={<Megaphone className="size-4" />}
        action={<DashboardChip>{plural(trackedSources.length, 'source')}</DashboardChip>}
      />

      {trackedSources.length === 0 ? (
        <DashboardEmptyState message="No lead source is marked for Digital Marketing yet. Ask an admin to turn it on under Resources." />
      ) : sources.length === 0 ? (
        <DashboardEmptyState
          message={`No leads yet this period from ${trackedSources.join(', ')}.`}
        />
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-1 pb-2">Source</th>
                <th className="px-1 pb-2 text-right">Leads</th>
                <th className="px-1 pb-2 text-right">Consulted</th>
                <th className="px-1 pb-2 text-right">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((row) => (
                <tr key={row.source} className="border-t border-slate-100">
                  <td className="px-1 py-2.5 font-semibold text-ink">{row.source}</td>
                  <td className="px-1 py-2.5 text-right tabular-nums">{row.leads}</td>
                  <td className="px-1 py-2.5 text-right tabular-nums">{row.consulted}</td>
                  <td className="px-1 py-2.5 text-right font-bold text-ink tabular-nums">
                    {row.enrolled}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  )
}

export function DigitalMarketingStudentsCard({ metrics, className }: CardProps) {
  const { students, earnings } = metrics

  return (
    <DashboardPanel variant="plump" className={className}>
      <DashboardCardHeader
        title="Students behind your commission"
        description="Enrolled this period from a Digital Marketing source, in any branch."
        icon={<GraduationCap className="size-4" />}
        action={
          students.length > 0 && earnings.commissionFee > 0 ? (
            <DashboardChip tone="brand">
              {formatCurrencyAmount(earnings.commissionFee)} each
            </DashboardChip>
          ) : null
        }
      />

      {students.length === 0 ? (
        <DashboardEmptyState message="No students from your sources enrolled this period yet." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {students.map((student) => (
            <li
              key={student.id}
              className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{student.fullName}</p>
                <p className="truncate text-xs text-slate-500">
                  {[student.srNumber, student.branchName].filter(Boolean).join(' · ')}
                </p>
              </div>
              <p className="truncate text-xs text-slate-600">
                <span className="text-slate-400">Source </span>
                {student.source}
              </p>
              <p className="truncate text-xs text-slate-600">
                <span className="text-slate-400">Counsellor </span>
                {student.counsellorName || '–'}
              </p>
              <p className="text-xs font-semibold text-slate-600 tabular-nums sm:text-right">
                {formatDate(student.enrollmentDate)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  )
}
