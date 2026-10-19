import { Layers, MessageSquareText, UserPlus, Users, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
  type HeroStat,
} from '../../../shared/components/page'
import { formatCurrencyCompact } from '../../../shared/lib/currency'
import { DashboardChip } from '../../admin/components/dashboard-kit'
import {
  MARKETING_ANCHORS,
  type MarketingKpiValue,
  type MarketingPerformanceMetrics,
} from '../types/marketing-dashboard'

function jumpTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function changeCaption(kpi: MarketingKpiValue) {
  if (kpi.changePct == null) return `${kpi.previous} last period`
  if (kpi.changePct === 0) return 'Same as last period'
  return `${kpi.changePct > 0 ? 'Up' : 'Down'} ${Math.abs(kpi.changePct)}% on last period`
}

export function MarketingDashboardHero({
  metrics,
  periodPicker,
}: {
  metrics?: MarketingPerformanceMetrics
  periodPicker: ReactNode
}) {
  const kpis = metrics?.kpis

  const stats: HeroStat[] = [
    {
      id: 'leads',
      label: 'New leads',
      icon: Users,
      value: kpis ? kpis.newLeads.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.newLeads) : undefined,
      hint: 'Jump to your funnel',
      onSelect: () => jumpTo(MARKETING_ANCHORS.funnel),
    },
    {
      id: 'consults',
      label: 'Telemarketing',
      icon: MessageSquareText,
      value: kpis ? kpis.consults.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.consults) : undefined,
      hint: 'Jump to your goals',
      onSelect: () => jumpTo(MARKETING_ANCHORS.goals),
    },
    {
      id: 'enrollments',
      label: 'Enrollments',
      icon: UserPlus,
      value: kpis ? kpis.enrollments.current.toLocaleString('en-US') : '–',
      caption: kpis ? changeCaption(kpis.enrollments) : undefined,
      hint: 'Jump to your goals',
      onSelect: () => jumpTo(MARKETING_ANCHORS.goals),
    },
  ]

  return (
    <PageHero
      eyebrow="My performance"
      title="Performance overview"
      description="Your leads, Telemarketing and expected pay for the bookkeeping period you pick."
      theme="dawn"
      pattern="ribbons"
      actions={periodPicker}
      stats={stats}
      spotlight={
        kpis ? (
          <HeroSpotlight
            title={`${formatCurrencyCompact(kpis.expectedPay.current)} expected pay`}
            description={
              kpis.expectedPay.previous > 0
                ? `Last period: ${formatCurrencyCompact(kpis.expectedPay.previous)}`
                : 'Your estimate for this period so far.'
            }
            actions={
              <HeroPillButton
                icon={Wallet}
                onClick={() => jumpTo(MARKETING_ANCHORS.pay)}
              >
                See how it adds up
              </HeroPillButton>
            }
          />
        ) : undefined
      }
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
