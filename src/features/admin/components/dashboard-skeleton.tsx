export function DashboardKpiSkeleton() {
  return (
    <div className="grid items-stretch gap-4 xl:grid-cols-2">
      <div className="animate-pulse rounded-[1.5rem] bg-[#1B3654] p-6">
        <div className="h-3 w-20 rounded bg-white/15" />
        <div className="mt-4 h-10 w-48 rounded bg-white/20" />
        <div className="mt-8 h-16 rounded bg-white/10" />
        <div className="mt-6 h-4 w-40 rounded bg-white/10" />
      </div>
      <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[1.5rem] border border-slate-200/80 bg-white p-5"
          >
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="mt-4 h-8 w-20 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <div className="animate-pulse rounded-[1.5rem] border border-slate-200/80 bg-white p-5 xl:col-span-3">
        <div className="mb-5 space-y-2">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-4 w-48 rounded bg-slate-100" />
        </div>
        <div className="h-[220px] rounded-2xl bg-slate-100" />
      </div>
      <div className="animate-pulse rounded-[1.5rem] border border-[#D8E6FA] bg-[#F5F9FF] p-5 xl:col-span-2">
        <div className="mb-5 space-y-2">
          <div className="h-5 w-32 rounded bg-slate-100" />
          <div className="h-4 w-40 rounded bg-slate-100" />
        </div>
        <div className="flex h-[220px] items-end gap-3">
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
    <div className="grid gap-4 xl:grid-cols-12">
      <div className="animate-pulse rounded-[1.5rem] border border-slate-200/80 bg-white p-5 xl:col-span-5">
        <div className="mb-5 h-5 w-40 rounded bg-slate-100" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="mx-auto h-10 rounded-lg bg-slate-100"
              style={{ width: `${88 - index * 8}%` }}
            />
          ))}
        </div>
      </div>
      <div className="animate-pulse rounded-[1.5rem] bg-white p-5 ring-1 ring-slate-200/70 xl:col-span-4">
        <div className="mb-5 h-5 w-36 rounded bg-slate-100" />
        <div className="mx-auto size-36 rounded-full bg-slate-100" />
      </div>
      <div className="animate-pulse rounded-[1.5rem] border border-[#D8E6FA] bg-[#F5F9FF] p-5 xl:col-span-3">
        <div className="mb-5 h-5 w-32 rounded bg-slate-100" />
        <div className="mx-auto size-32 rounded-full bg-white" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-16 rounded-2xl bg-white" />
          <div className="h-16 rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  )
}
