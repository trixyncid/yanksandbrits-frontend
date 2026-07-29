import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'

type PaidLeaveListStateProps = {
  onRetry?: () => void
}

export function PaidLeaveListLoadingState() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="h-6 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="space-y-3 p-6">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl bg-slate-100"
            style={{ animationDelay: `${index * 40}ms` }}
          />
        ))}
      </div>
    </Card>
  )
}

export function PaidLeaveListErrorState({ onRetry }: PaidLeaveListStateProps) {
  return (
    <Card className="px-6 py-16 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle className="size-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        Unable to load paid leave
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Something went wrong while fetching paid leave records. You can try
        again.
      </p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      ) : null}
    </Card>
  )
}
