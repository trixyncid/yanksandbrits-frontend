type DashboardStat = {
  id: string
  label: string
  value: string
  detail: string
  delta?: string
  deltaTone?: 'up' | 'neutral' | 'down'
}

const dashboardStats: DashboardStat[] = [
  {
    id: 'sessions',
    label: 'Today sessions',
    value: '28',
    detail: 'Across all classrooms',
    delta: '+4 from yesterday',
    deltaTone: 'up',
  },
  {
    id: 'students',
    label: 'Total students',
    value: '1,246',
    detail: 'Active enrollments',
    delta: '+18 this month',
    deltaTone: 'up',
  },
  {
    id: 'tutors',
    label: 'Active tutors',
    value: '14',
    detail: 'On schedule today',
    delta: '3 currently teaching',
    deltaTone: 'neutral',
  },
  {
    id: 'rooms',
    label: 'Open rooms',
    value: '6',
    detail: 'Available for booking',
    delta: '2 free next hour',
    deltaTone: 'neutral',
  },
]

const deltaClassName: Record<NonNullable<DashboardStat['deltaTone']>, string> = {
  up: 'text-[#2F9E6E]',
  down: 'text-[#DC4A4A]',
  neutral: 'text-slate-500',
}

export function DashboardStats() {
  return (
    <div className="border-t border-slate-200">
      <div className="grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x xl:grid-cols-4 xl:divide-y-0">
        {dashboardStats.map((stat) => (
          <div key={stat.id} className="px-6 py-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
              {stat.label}
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-[2rem] leading-none font-semibold tracking-tight text-slate-900 tabular-nums">
                {stat.value}
              </p>
              {stat.delta ? (
                <p
                  className={`pb-0.5 text-right text-xs font-medium ${deltaClassName[stat.deltaTone ?? 'neutral']}`}
                >
                  {stat.delta}
                </p>
              ) : null}
            </div>

            <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
