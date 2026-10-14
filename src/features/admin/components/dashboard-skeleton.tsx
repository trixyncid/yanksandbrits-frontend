/** Loading placeholders shaped like the dashboard bento grid. */

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-canvas ${className ?? ''}`} />
}

export function DashboardKpiSkeleton() {
  return (
    <div className="grid items-stretch gap-3 xl:grid-cols-12" aria-busy="true">
      <div className="rounded-[1.75rem] bg-white p-5 xl:col-span-8">
        <div className="flex items-center gap-3">
          <Pulse className="size-10" />
          <div className="space-y-2">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-3 w-44" />
          </div>
        </div>
        <Pulse className="mt-6 h-10 w-56" />
        <div className="mt-6 h-40 animate-pulse rounded-3xl bg-canvas/70" />
      </div>
      <div className="rounded-[1.75rem] bg-ink p-5 xl:col-span-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-white/15" />
        <div className="mt-5 h-12 w-16 animate-pulse rounded-2xl bg-white/15" />
        <div className="mt-5 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-3xl bg-white/8" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="grid gap-3 xl:grid-cols-12" aria-busy="true">
      <div className="rounded-[1.75rem] bg-white p-5 xl:col-span-4">
        <Pulse className="h-4 w-28" />
        <div className="mt-6 flex h-[180px] items-end gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 animate-pulse rounded-full bg-canvas"
              style={{ height: `${40 + (index % 3) * 20}%` }}
            />
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] bg-white p-5 xl:col-span-5">
        <Pulse className="h-4 w-32" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Pulse key={index} className="h-11" />
          ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] bg-brand-50 p-5 xl:col-span-3">
        <Pulse className="h-4 w-24 bg-white" />
        <div className="mx-auto mt-6 size-32 animate-pulse rounded-full border-[14px] border-white" />
      </div>
    </div>
  )
}

export function DashboardInsightsSkeleton() {
  return (
    <div className="grid gap-3 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[1.75rem] bg-white p-5">
          <Pulse className="h-4 w-32" />
          <Pulse className="mt-2 h-3 w-44" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((__, row) => (
              <div key={row} className="h-12 animate-pulse rounded-2xl bg-canvas/70" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
