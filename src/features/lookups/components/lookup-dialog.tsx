import { Loader2, type LucideIcon } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Label } from '../../../shared/components/ui/label'
import { cn } from '../../../shared/lib/cn'

/** Add / edit dialog shell shared by the lookup pages. */
export function LookupDialog({
  open,
  onOpenChange,
  icon: Icon,
  eyebrow,
  title,
  description,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  wide = false,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  submitLabel: string
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  wide?: boolean
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className={cn(
          'max-h-[90vh] overflow-hidden rounded-[1.75rem] p-0',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <form onSubmit={onSubmit} className="flex max-h-[90vh] flex-col">
          <div className="shrink-0 bg-canvas px-6 pt-6 pb-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <DialogHeader className="min-w-0 gap-0.5">
                <p className="text-[11px] font-bold tracking-[0.14em] text-brand-700 uppercase">
                  {eyebrow}
                </p>
                <DialogTitle className="text-ink">{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {children}
          </div>

          <DialogFooter className="mt-0 shrink-0 gap-2 border-t border-slate-100 px-6 py-4">
            <Button
              type="button"
              variant="soft"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Label + control + optional hint for fields inside a lookup dialog. */
export function LookupField({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}
