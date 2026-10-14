import { Loader2, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../ui/button'

/**
 * Floating action bar pinned to the bottom of every create and edit form.
 * Keeps Save in reach on long forms and puts Delete on the opposite side so
 * it is hard to hit by mistake.
 */
export function FormSaveBar({
  mode,
  isSubmitting,
  onCancel,
  onDelete,
  deleteLabel = 'Delete',
  submitLabel,
  hint,
  extraActions,
}: {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  onCancel: () => void
  onDelete?: () => void
  deleteLabel?: string
  /** Defaults to "Create" or "Save changes". */
  submitLabel?: string
  /** Short reminder shown on the left when there is no delete action. */
  hint?: ReactNode
  /** Buttons placed before Cancel, e.g. "Save and add another". */
  extraActions?: ReactNode
}) {
  const label = submitLabel ?? (mode === 'create' ? 'Create' : 'Save changes')

  return (
    <div className="sticky bottom-3 z-10 animate-in fade-in slide-in-from-bottom-2 delay-150">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.75rem] bg-white/95 py-2 pr-2 pl-3 shadow-[0_16px_40px_-16px_rgba(20,27,58,0.35)] ring-1 ring-slate-200/60 backdrop-blur-md sm:pl-4">
        <div className="min-w-0">
          {mode === 'edit' && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="size-4" />
              {deleteLabel}
            </Button>
          ) : hint ? (
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          <Button
            type="button"
            variant="soft"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : label}
          </Button>
        </div>
      </div>
    </div>
  )
}
