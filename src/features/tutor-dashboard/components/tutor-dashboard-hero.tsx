import { BookOpen, Clock3, Layers, UserCheck, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageHero, type HeroStat } from '../../../shared/components/page'
import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import {
  TUTOR_ANCHORS,
  type TutorKpiValue,
  type TutorPerformanceMetrics,
} from '../types/tutor-dashboard'

function jumpTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function changeCaption(kpi: TutorKpiValue) {
  if (kpi.changePct == null) return 'Nothing to compare yet'
  if (kpi.changePct === 0) return 'Same as last period'
  return `${kpi.changePct > 0 ? 'Up' : 'Down'} ${Math.abs(kpi.changePct)}% on last period`
}

export function TutorDashboardHero({
  metrics,
  periodPicker,
}: {
  metrics?: TutorPerformanceMetrics
  periodPicker: ReactNode
}) {
  const kpis = metrics?.kpis

  const stats: HeroStat[] = [
    {
      id: 'pay',
      label: 'Expected pay',
      icon: Wallet,
      value: kpis ? (
        <span title={formatCurrencyAmount(kpis.expectedPay.current)}>
          {formatCurrencyCompact(kpis.expectedPay.current)}
        </span>
      ) : (
        '–'
      ),
      caption: kpis ? changeCaption(kpis.expectedPay) : undefined,
      hint: 'See how your pay adds up',
      onSelect: () => jumpTo(TUTOR_ANCHORS.pay),
    },
    {
      id: 'sessions',
      label: 'Sessions taught',
      icon: BookOpen,
      value: kpis ? kpis.finishedSessions.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.finishedSessions) : undefined,
      hint: 'Jump to your weekly sessions',
      onSelect: () => jumpTo(TUTOR_ANCHORS.teaching),
    },
    {
      id: 'hours',
      label: 'Hours taught',
      icon: Clock3,
      value: kpis
        ? kpis.hoursTaught.current.toLocaleString('en-US', {
            maximumFractionDigits: 1,
          })
        : '–',
      caption: kpis ? changeCaption(kpis.hoursTaught) : undefined,
      hint: 'Jump to your weekly sessions',
      onSelect: () => jumpTo(TUTOR_ANCHORS.teaching),
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      value: kpis ? `${kpis.studentAttendanceRate.current}%` : '–',
      caption: kpis ? changeCaption(kpis.studentAttendanceRate) : undefined,
      hint: 'Jump to your classes',
      onSelect: () => jumpTo(TUTOR_ANCHORS.classes),
    },
  ]

  return (
    <PageHero
      eyebrow="My teaching"
      title="Performance overview"
      description="Your sessions, students' attendance and expected pay for the bookkeeping period you pick."
      theme="mist"
      pattern="rings"
      actions={periodPicker}
      stats={stats}
    >
      {metrics?.period.label ? (
        <div className="flex flex-wrap items-center gap-2">
          <DashboardChip className="bg-white/80 text-ink">
            Showing {metrics.period.label}
          </DashboardChip>
          {metrics.comparisonPeriod.label ? (
            <DashboardChip className="bg-white/50 text-slate-600">
              Compared with {metrics.comparisonPeriod.label}
            </DashboardChip>
          ) : null}
          {metrics.period.periodType ? (
            <DashboardChip icon={Layers} className="bg-white/50 text-slate-600">
              {metrics.period.periodType} tiers
            </DashboardChip>
          ) : null}
        </div>
      ) : null}
    </PageHero>
  )
}
