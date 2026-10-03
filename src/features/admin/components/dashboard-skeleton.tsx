export function DashboardKpiSkeleton() {
  return (
    <div className="grid items-stretch gap-2 xl:grid-cols-2">
      <div className="animate-pulse rounded-xl bg-[#1B3654] p-3">
        <div className="h-2.5 w-16 rounded bg-white/15" />
        <div className="mt-2 h-7 w-40 rounded bg-white/20" />
        <div className="mt-4 h-12 rounded bg-white/10" />
        <div className="mt-3 h-3 w-32 rounded bg-white/10" />
      </div>
      <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-2 sm:grid-rows-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-slate-200/80 bg-white p-3"
          >
            <div className="h-2.5 w-20 rounded bg-slate-100" />
            <div className="mt-2 h-6 w-16 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="grid gap-2 xl:grid-cols-5">
      <div className="animate-pulse rounded-xl border border-slate-200/80 bg-white p-3 xl:col-span-3">
        <div className="mb-3 space-y-1.5">
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="h-3 w-40 rounded bg-slate-100" />
        </div>
        <div className="h-[180px] rounded-xl bg-slate-100" />
      </div>
      <div className="animate-pulse rounded-xl border border-[#D8E6FA] bg-[#F5F9FF] p-3 xl:col-span-2">
        <div className="mb-3 space-y-1.5">
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="h-3 w-36 rounded bg-slate-100" />
        </div>
        <div className="flex h-[180px] items-end gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-md bg-slate-200/80"
              style={{ height: `${40 + (index % 3) * 20}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardInsightsSkeleton() {
  return (
    <div className="grid gap-2 xl:grid-cols-12">
      <div className="animate-pulse rounded-xl border border-slate-200/80 bg-white p-3 xl:col-span-5">
        <div className="mb-3 h-4 w-32 rounded bg-slate-100" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="mx-auto h-8 rounded-lg bg-slate-100"
              style={{ width: `${88 - index * 8}%` }}
            />
          ))}
        </div>
      </div>
      <div className="animate-pulse rounded-xl bg-white p-3 ring-1 ring-slate-200/70 xl:col-span-4">
        <div className="mb-3 h-4 w-28 rounded bg-slate-100" />
        <div className="mx-auto size-28 rounded-full bg-slate-100" />
      </div>
      <div className="animate-pulse rounded-xl border border-[#D8E6FA] bg-[#F5F9FF] p-3 xl:col-span-3">
        <div className="mb-3 h-4 w-28 rounded bg-slate-100" />
        <div className="mx-auto size-24 rounded-full bg-white" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-12 rounded-xl bg-white" />
          <div className="h-12 rounded-xl bg-white" />
        </div>
      </div>
    </div>
  )
}
