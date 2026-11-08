import { Banknote, BadgeCheck, GraduationCap, Layers, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageHero, type HeroStat } from '../../../shared/components/page'
import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import {
  FINANCE_ANCHORS,
  type FinanceKpiValue,
  type FinancePerformanceMetrics,
} from '../types/finance-dashboard'

function jumpTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function changeCaption(kpi: FinanceKpiValue) {
  if (kpi.changePct == null) return 'Nothing to compare yet'
  if (kpi.changePct === 0) return 'Same as last period'
  return `${kpi.changePct > 0 ? 'Up' : 'Down'} ${Math.abs(kpi.changePct)}% on last period`
}

function money(amount: number) {
  return <span title={formatCurrencyAmount(amount)}>{formatCurrencyCompact(amount)}</span>
}

export function FinanceDashboardHero({
  metrics,
  periodPicker,
}: {
  metrics?: FinancePerformanceMetrics
  periodPicker: ReactNode
}) {
  const kpis = metrics?.kpis

  const stats: HeroStat[] = [
    {
      id: 'pay',
      label: 'Expected pay',
      icon: Wallet,
      value: kpis ? money(kpis.expectedPay.current) : '–',
      caption: kpis ? changeCaption(kpis.expectedPay) : undefined,
      hint: 'See how your pay adds up',
      onSelect: () => jumpTo(FINANCE_ANCHORS.pay),
    },
    {
      id: 'students',
      label: 'New students',
      icon: GraduationCap,
      value: kpis ? kpis.newStudents.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.newStudents) : undefined,
      hint: 'Each one adds to your commission',
      onSelect: () => jumpTo(FINANCE_ANCHORS.pay),
    },
    {
      id: 'verified',
      label: 'Payments verified',
      icon: BadgeCheck,
      value: kpis ? kpis.paymentsVerified.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.paymentsVerified) : undefined,
      hint: 'Jump to your review work',
      onSelect: () => jumpTo(FINANCE_ANCHORS.work),
    },
    {
      id: 'collected',
      label: 'Tuition collected',
      icon: Banknote,
      value: kpis ? money(kpis.tuitionCollected.current) : '–',
      caption: kpis ? changeCaption(kpis.tuitionCollected) : undefined,
      hint: 'Jump to collections',
      onSelect: () => jumpTo(FINANCE_ANCHORS.money),
    },
  ]

  return (
    <PageHero
      eyebrow="My finance work"
      title="Performance overview"
      description="Your pay and commission, the payments you verified, and the money that came in for the bookkeeping period you pick."
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
          <DashboardChip icon={Layers} className="bg-white/50 text-slate-600">
            {metrics.period.branchName
              ? `New students: all branches · Collections: ${metrics.period.branchName}`
              : 'All branches'}
          </DashboardChip>
        </div>
      ) : null}
    </PageHero>
  )
}
