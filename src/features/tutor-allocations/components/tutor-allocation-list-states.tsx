import { AlertCircle, RefreshCw } from 'lucide-react'

import { GlassSurface } from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'

export function TutorAllocationListLoadingState() {
  return (
    <GlassSurface className="overflow-hidden">
      <div className="border-b border-[#C8D4F5]/80 px-4 py-3.5">
        <div className="h-5 w-44 animate-pulse rounded-lg bg-[#E8EEFF]" />
        <div className="mt-2 h-3.5 w-72 animate-pulse rounded-lg bg-slate-100/80" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-lg bg-[linear-gradient(90deg,#E8EEFF_0%,#F5F8FF_50%,#E8EEFF_100%)]"
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </div>
    </GlassSurface>
  )
}

export function TutorAllocationListErrorState({
  onRetry,
}: {
  onRetry?: () => void
}) {
  return (
    <GlassSurface className="px-5 py-12 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <AlertCircle className="size-5" />
      </div>
      <h2 className="mt-3 text-base font-semibold text-slate-900">
        Unable to load tutor allocations
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Something went wrong while fetching classes. You can try again.
      </p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      ) : null}
    </GlassSurface>
  )
}
