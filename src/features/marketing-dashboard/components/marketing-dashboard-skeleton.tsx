/** Loading placeholders shaped like the My Performance (marketing) bento. */

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-canvas ${className ?? ''}`} />
}

function OnInk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/12 ${className ?? ''}`} />
}

const BAR_HEIGHTS = [42, 68, 55, 30]

export function MarketingDashboardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading your performance">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="rounded-[1.75rem] bg-white p-5 lg:col-span-7">
          <div className="flex items-center gap-3">
            <Pulse className="size-10" />
            <div className="space-y-2">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-3 w-48" />
            </div>
          </div>
          <div className="mt-8 flex h-[200px] items-end gap-3">
            {BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className="flex-1 animate-pulse rounded-full bg-canvas"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] bg-ink p-5 lg:col-span-5">
          <OnInk className="h-4 w-32" />
          <div className="mt-6 flex items-center gap-5">
            <div className="size-28 animate-pulse rounded-full border-[12px] border-white/12" />
            <OnInk className="h-10 w-24" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/8" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="grid gap-2 rounded-[1.75rem] bg-white p-5 sm:grid-cols-3 lg:col-span-7">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3 rounded-3xl bg-canvas/70 p-4">
              <div className="size-24 animate-pulse rounded-full border-[11px] border-white" />
              <Pulse className="h-3 w-20 bg-white" />
            </div>
          ))}
        </div>
        <div className="rounded-[1.75rem] bg-white p-5 lg:col-span-5">
          <Pulse className="h-4 w-36" />
          <div className="mt-6 flex items-center gap-5">
            <div className="size-32 animate-pulse rounded-full border-[16px] border-canvas" />
            <div className="flex-1 space-y-2">
              <div className="h-16 animate-pulse rounded-3xl bg-canvas" />
              <div className="h-16 animate-pulse rounded-3xl bg-canvas" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-white p-5">
        <Pulse className="h-4 w-40" />
        <Pulse className="mt-5 h-3 w-full" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-3xl bg-canvas/70" />
          ))}
        </div>
      </div>
    </div>
  )
}
