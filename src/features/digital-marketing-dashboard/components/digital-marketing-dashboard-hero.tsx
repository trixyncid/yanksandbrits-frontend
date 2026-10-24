import { GraduationCap, Layers, MessagesSquare, Users, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageHero, type HeroStat } from '../../../shared/components/page'
import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import type { FinanceKpiValue } from '../../finance-dashboard/types/finance-dashboard'
import {
  DIGITAL_MARKETING_ANCHORS,
  type DigitalMarketingPerformanceMetrics,
} from '../types/digital-marketing-dashboard'

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

export function DigitalMarketingDashboardHero({
  metrics,
  periodPicker,
}: {
  metrics?: DigitalMarketingPerformanceMetrics
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
      onSelect: () => jumpTo(DIGITAL_MARKETING_ANCHORS.pay),
    },
    {
      id: 'students',
      label: 'New students',
      icon: GraduationCap,
      value: kpis ? kpis.newStudents.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.newStudents) : undefined,
      hint: 'See who enrolled',
      onSelect: () => jumpTo(DIGITAL_MARKETING_ANCHORS.students),
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
      value: kpis ? kpis.leads.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.leads) : undefined,
      hint: 'Jump to your lead sources',
      onSelect: () => jumpTo(DIGITAL_MARKETING_ANCHORS.leads),
    },
    {
      id: 'consulted',
      label: 'Consulted',
      icon: MessagesSquare,
      value: kpis ? kpis.consulted.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.consulted) : undefined,
      hint: 'Jump to your funnel',
      onSelect: () => jumpTo(DIGITAL_MARKETING_ANCHORS.leads),
    },
  ]

  return (
    <PageHero
      eyebrow="My digital marketing"
      title="Performance overview"
      description="Your pay and commission, and how leads from your digital marketing sources turned into students, for the bookkeeping period you pick."
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
            All branches
          </DashboardChip>
        </div>
      ) : null}
    </PageHero>
  )
}
