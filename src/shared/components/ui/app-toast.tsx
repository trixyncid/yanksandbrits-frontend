import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '../../lib/cn'
import type { AppToastType } from '../../lib/notify'

const TONES: Record<
  AppToastType,
  { icon: LucideIcon; badge: string; bar: string; label: string }
> = {
  success: {
    icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    bar: 'bg-emerald-500',
    label: 'Success',
  },
  error: {
    icon: CircleAlert,
    badge: 'bg-rose-50 text-rose-600 ring-rose-100',
    bar: 'bg-rose-500',
    label: 'Error',
  },
  warning: {
    icon: TriangleAlert,
    badge: 'bg-amber-50 text-amber-600 ring-amber-100',
    bar: 'bg-amber-500',
    label: 'Warning',
  },
  info: {
    icon: Info,
    badge: 'bg-brand-50 text-brand-500 ring-brand-100',
    bar: 'bg-brand-500',
    label: 'Notice',
  },
}

/** The app's toast card, rendered through sonner's `toast.custom`. */
export function AppToast({
  id,
  type,
  title,
  description,
  duration,
}: {
  id: string | number
  type: AppToastType
  title: string
  description?: string
  duration: number
}) {
  const tone = TONES[type]
  const Icon = tone.icon

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className="group/toast pointer-events-auto relative w-full overflow-hidden rounded-[1.25rem] bg-white/95 shadow-[0_18px_40px_-14px_rgba(20,27,58,0.35)] ring-1 ring-slate-200/70 backdrop-blur-md"
    >
      <div className="flex items-center gap-3 py-3 pr-2.5 pl-3">
        <span
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-full ring-4',
            tone.badge,
          )}
        >
          <Icon className="size-[1.1rem]" strokeWidth={2.1} aria-hidden />
          <span className="sr-only">{tone.label}:</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-bold tracking-tight text-ink">
            {title}
          </p>
          {description ? (
            <p className="mt-0.5 text-[13px] leading-snug break-words text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => toast.dismiss(id)}
          className="inline-flex size-8 shrink-0 items-center justify-center self-start rounded-full text-slate-400 transition hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>
      {/* Countdown until the toast closes; pauses while hovered, like the timer. */}
      <div aria-hidden className="absolute inset-x-4 bottom-0 h-0.5 overflow-hidden rounded-full bg-canvas">
        <div
          className={cn(
            'h-full origin-left animate-[toast-countdown_linear_forwards] rounded-full group-hover/toast:[animation-play-state:paused]',
            tone.bar,
          )}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
}
