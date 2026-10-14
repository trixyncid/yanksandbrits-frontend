/** Loading placeholders shaped like the tutor dashboard bento. */

const BAR_HEIGHTS = [38, 62, 50, 74, 44, 58]

export function TutorDashboardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading your performance">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="flex flex-col items-center rounded-[1.75rem] bg-ink p-5 lg:col-span-4">
          <div className="h-4 w-32 self-start animate-pulse rounded-full bg-white/12" />
          <div className="mt-6 size-40 animate-pulse rounded-full border-[16px] border-white/12" />
          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/8" />
            ))}
          </div>
        </div>
        <div className="rounded-[1.75rem] bg-white p-5 lg:col-span-8">
          <div className="h-4 w-40 animate-pulse rounded-full bg-canvas" />
          <div className="mt-8 flex h-[220px] items-end gap-3">
            {BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className="flex-1 animate-pulse rounded-full bg-canvas"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="rounded-[1.75rem] bg-white p-5 lg:col-span-7">
          <div className="h-4 w-44 animate-pulse rounded-full bg-canvas" />
          <div className="mt-5 h-3 animate-pulse rounded-full bg-canvas" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-3xl bg-canvas/70" />
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-[1.75rem] bg-white p-5 lg:col-span-5">
          <div className="h-4 w-36 animate-pulse rounded-full bg-canvas" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-3xl bg-canvas/70" />
          ))}
        </div>
      </div>
    </div>
  )
}
