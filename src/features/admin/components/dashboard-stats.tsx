import { cn } from '../../../shared/lib/cn'

type DashboardStat = {
  id: string
  label: string
  value: string
  detail: string
  delta?: string
  deltaTone?: 'up' | 'neutral' | 'down'
}

export type DashboardStatsProps = {
  stats: DashboardStat[]
}

const deltaClassName: Record<NonNullable<DashboardStat['deltaTone']>, string> = {
  up: 'bg-emerald-50 text-emerald-700',
  down: 'bg-rose-50 text-rose-700',
  neutral: 'bg-canvas text-slate-500',
}

/** Row of white stat tiles. */
export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.id} className="rounded-[1.75rem] bg-white p-5">
          <p className="text-sm font-semibold text-ink">{stat.label}</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-3xl leading-none font-bold tracking-tight text-ink tabular-nums">
              {stat.value}
            </p>
            {stat.delta ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  deltaClassName[stat.deltaTone ?? 'neutral'],
                )}
              >
                {stat.delta}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
        </div>
      ))}
    </div>
  )
}
