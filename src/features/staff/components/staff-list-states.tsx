import { AlertCircle, LoaderCircle } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'

export function StaffListLoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <LoaderCircle className="size-4 animate-spin text-[#4274B9]" />
        Loading user accounts...
      </div>
    </div>
  )
}

export function StaffListErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-rose-100 bg-white px-6 text-center shadow-sm">
      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle className="size-5" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          Unable to load users
        </h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Something went wrong while fetching user accounts. You can try again.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
