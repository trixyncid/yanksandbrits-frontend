import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import { personInitials } from '../lib/people-format'

/**
 * Small building blocks shared by the people pages (staff, tutors,
 * education counsellors, paid leave). Kept here so every people list reads
 * as one family: avatar-led identity cells, soft status pills and round row
 * actions.
 */

const AVATAR_TONES = [
  'bg-brand-100 text-brand-700',
  'bg-brand-500 text-white',
  'bg-ink text-white',
  'bg-brand-200 text-brand-800',
  'bg-brand-gray-soft text-ink',
  'bg-brand-700 text-white',
] as const

function toneFor(seed: string) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length]
}

const AVATAR_SIZES = {
  sm: 'size-9 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-20 text-2xl',
} as const

/** Round initials avatar with a stable brand tint per person. */
export function PersonAvatar({
  name,
  seed,
  size = 'md',
  className,
  muted = false,
}: {
  name: string
  /** Value used to pick the tint; defaults to the name. */
  seed?: string
  size?: keyof typeof AVATAR_SIZES
  className?: string
  /** Greyed out, e.g. for inactive accounts. */
  muted?: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight',
        AVATAR_SIZES[size],
        muted ? 'bg-canvas text-slate-400' : toneFor(seed ?? name),
        className,
      )}
    >
      {personInitials(name)}
    </span>
  )
}

/** Avatar + name + secondary lines; used as the first column of people lists. */
export function PersonIdentityCell({
  name,
  seed,
  pin,
  lines = [],
  muted,
  tag,
}: {
  name: string
  seed?: string
  pin?: string | null
  lines?: (string | null | undefined)[]
  muted?: boolean
  tag?: ReactNode
}) {
  const visibleLines = lines.filter((line): line is string => Boolean(line))
  return (
    <div className="flex min-w-[15rem] items-center gap-3 py-0.5">
      <PersonAvatar name={name} seed={seed} muted={muted} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          {pin ? (
            <span className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
              {pin}
            </span>
          ) : null}
          {tag}
        </div>
        {visibleLines.map((line) => (
          <p key={line} className="mt-0.5 truncate text-xs text-slate-500">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

type PillTone = 'brand' | 'muted' | 'emerald' | 'amber' | 'rose' | 'ink'

const PILL_TONES: Record<PillTone, { pill: string; dot: string }> = {
  brand: { pill: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  muted: { pill: 'bg-canvas text-slate-500', dot: 'bg-slate-400' },
  emerald: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  amber: { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  rose: { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  ink: { pill: 'bg-ink text-white', dot: 'bg-brand-300' },
}

/** Soft rounded pill with a leading dot. */
export function SoftPill({
  tone = 'brand',
  children,
  dot = true,
  className,
}: {
  tone?: PillTone
  children: ReactNode
  dot?: boolean
  className?: string
}) {
  const styles = PILL_TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        styles.pill,
        className,
      )}
    >
      {dot ? (
        <span aria-hidden className={cn('size-1.5 rounded-full', styles.dot)} />
      ) : null}
      {children}
    </span>
  )
}

export function ActiveStatusPill({ active }: { active: boolean }) {
  return (
    <SoftPill tone={active ? 'brand' : 'muted'}>
      {active ? 'Active' : 'Inactive'}
    </SoftPill>
  )
}

type RowActionTone = 'view' | 'edit' | 'accent' | 'delete'

const ROW_ACTION_TONES: Record<RowActionTone, string> = {
  view: 'text-ink hover:bg-brand-500 hover:text-white',
  edit: 'text-ink hover:bg-ink hover:text-white',
  accent: 'text-brand-600 hover:bg-brand-600 hover:text-white',
  delete: 'text-rose-500 hover:bg-rose-500 hover:text-white',
}

/** Round icon button used in table action columns. */
export function RowActionButton({
  label,
  icon: Icon,
  onClick,
  tone = 'view',
  disabled,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  tone?: RowActionTone
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full bg-canvas transition disabled:cursor-not-allowed disabled:opacity-40',
        ROW_ACTION_TONES[tone],
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

/** Header label for the sticky action column. */
export function ActionColumnHeader() {
  return (
    <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
      Actions
    </span>
  )
}

/** Paid-leave balance as a compact pill. */
export function LeaveBalancePill({ left }: { left: number }) {
  return (
    <SoftPill tone={left <= 0 ? 'amber' : 'muted'} dot={false}>
      <span className="tabular-nums">{left}</span>
      {left === 1 ? 'day left' : 'days left'}
    </SoftPill>
  )
}
