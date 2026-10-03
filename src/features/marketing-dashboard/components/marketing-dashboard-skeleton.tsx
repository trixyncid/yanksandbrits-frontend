/** Loading placeholders shaped like My Performance (marketing). */

function PulseBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className ?? ''}`} />
}

function PulseBlockOnNavy({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/15 ${className ?? ''}`} />
}

const FUNNEL_BAR_HEIGHTS = [42, 68, 55, 80, 48, 62]

export function MarketingDashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading performance">
      {/* Expected pay + commission tier */}
      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="rounded-[1.25rem] border border-slate-200/80 bg-white p-3.5 sm:p-4 lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PulseBlock className="size-7 rounded-lg" />
              <PulseBlock className="h-4 w-24" />
            </div>
            <PulseBlock className="h-5 w-20 rounded-full" />
          </div>
          <PulseBlock className="mt-3 h-9 w-44 sm:w-56" />
          <PulseBlock className="mt-2 h-3 w-28" />
          <div className="mt-5 flex flex-wrap gap-1.5">
            <PulseBlock className="h-6 w-20 rounded-full" />
            <PulseBlock className="h-6 w-24 rounded-full" />
            <PulseBlock className="h-6 w-20 rounded-full" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#1B2A5A] p-3.5 sm:p-4 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <PulseBlockOnNavy className="h-4 w-28" />
            <PulseBlockOnNavy className="size-8 rounded-xl" />
          </div>
          <PulseBlockOnNavy className="mt-2 h-3 w-40" />
          <div className="mt-4 flex items-end justify-between gap-3">
            <PulseBlockOnNavy className="h-8 w-16" />
            <div className="mb-1 w-full max-w-[7rem]">
              <PulseBlockOnNavy className="mb-1 ml-auto h-3 w-8" />
              <PulseBlockOnNavy className="h-1.5 w-full rounded-full" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <PulseBlockOnNavy className="h-2.5 w-10" />
                <PulseBlockOnNavy className="mt-1.5 h-4 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.25rem] border border-slate-200/80 bg-white p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PulseBlock className="size-6 rounded-md" />
                <PulseBlock className="h-3 w-16" />
              </div>
              <PulseBlock className="h-5 w-12 rounded-full" />
            </div>
            <PulseBlock className="mt-3 h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Student payments */}
      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-0 sm:p-0">
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:border-r sm:border-slate-100 sm:p-5">
            <div>
              <PulseBlock className="h-4 w-36" />
              <PulseBlock className="mt-2 h-3 w-52" />
            </div>
            <PulseBlock className="h-2.5 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-[min(100%,22rem)] sm:shrink-0 sm:gap-0">
            <div className="px-4 py-3.5 sm:px-5 sm:py-5">
              <PulseBlock className="h-3 w-20" />
              <PulseBlock className="mt-2 h-8 w-12" />
              <PulseBlock className="mt-2 h-3 w-24" />
            </div>
            <div className="border-l border-slate-100 px-4 py-3.5 sm:px-5 sm:py-5">
              <PulseBlock className="h-3 w-20" />
              <PulseBlock className="mt-2 h-8 w-12" />
              <PulseBlock className="mt-2 h-3 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Funnel + goals */}
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        <div className="rounded-[1.25rem] border border-slate-200/80 bg-white p-4 lg:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <PulseBlock className="h-4 w-28" />
              <PulseBlock className="mt-2 h-3 w-40" />
            </div>
            <PulseBlock className="size-9 rounded-2xl" />
          </div>
          <div className="mt-6 flex h-[200px] items-end gap-2 sm:gap-3">
            {FUNNEL_BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className="animate-pulse flex-1 rounded-t-lg bg-slate-100"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] bg-[#1B2A5A] p-4 lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <PulseBlockOnNavy className="h-4 w-32" />
              <PulseBlockOnNavy className="mt-2 h-3 w-40" />
            </div>
            <PulseBlockOnNavy className="size-9 rounded-2xl" />
          </div>
          <ul className="mt-6 space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <PulseBlockOnNavy className="size-8 shrink-0 rounded-xl" />
                    <div className="min-w-0 space-y-1.5">
                      <PulseBlockOnNavy className="h-3.5 w-24" />
                      <PulseBlockOnNavy className="h-2.5 w-32" />
                    </div>
                  </div>
                  <PulseBlockOnNavy className="h-4 w-10" />
                </div>
                <PulseBlockOnNavy className="mt-2.5 h-2 w-full rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Earnings + lead sources */}
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        <div className="rounded-[1.25rem] border border-slate-200/80 bg-white p-4 lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <PulseBlock className="h-4 w-28" />
            <PulseBlock className="h-5 w-24 rounded-full" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <PulseBlock className="size-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <PulseBlock className="h-3 w-24" />
                    <PulseBlock className="h-3 w-16" />
                  </div>
                  <PulseBlock className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200/80 bg-white p-4 lg:col-span-5">
          <PulseBlock className="h-4 w-28" />
          <PulseBlock className="mt-2 h-3 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <PulseBlock className="h-8 flex-1 rounded-lg" />
                <PulseBlock className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
