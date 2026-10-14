import { cn } from '../../lib/cn'
import { Label } from './label'

type StatusToggleProps = {
  id?: string
  label?: string
  value: boolean
  onChange: (next: boolean) => void
  activeLabel?: string
  inactiveLabel?: string
  description?: string
  error?: string
  disabled?: boolean
  className?: string
  /** `soft`: grey track with an ink "Active" pill, for the refreshed pages. */
  tone?: 'default' | 'soft'
}

export function StatusToggle({
  id = 'status-toggle',
  label = 'Active Status',
  value,
  onChange,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  description,
  error,
  disabled = false,
  className,
  tone = 'soft',
}: StatusToggleProps) {
  const soft = tone === 'soft'
  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label htmlFor={`${id}-active`}>{label}</Label> : null}

      <div
        role="radiogroup"
        aria-label={label || 'Status'}
        aria-disabled={disabled}
        className={cn(
          'inline-flex w-full rounded-full p-1 sm:w-auto',
          soft
            ? 'bg-canvas'
            : 'border border-slate-200/80 bg-white shadow-sm',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <button
          id={`${id}-active`}
          type="button"
          role="radio"
          aria-checked={value}
          disabled={disabled}
          onClick={() => onChange(true)}
          className={cn(
            'h-10 flex-1 rounded-full px-5 text-sm font-semibold transition sm:min-w-[7.5rem] sm:flex-none',
            value
              ? soft
                ? 'bg-ink text-white'
                : 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
          )}
        >
          {activeLabel}
        </button>
        <button
          id={`${id}-inactive`}
          type="button"
          role="radio"
          aria-checked={!value}
          disabled={disabled}
          onClick={() => onChange(false)}
          className={cn(
            'h-10 flex-1 rounded-full px-5 text-sm font-semibold transition sm:min-w-[7.5rem] sm:flex-none',
            !value
              ? soft
                ? 'bg-white text-ink shadow-sm'
                : 'bg-slate-700 text-white shadow-sm shadow-slate-700/20'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
          )}
        >
          {inactiveLabel}
        </button>
      </div>

      {description ? (
        <p className="text-xs text-slate-400">{description}</p>
      ) : null}
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}
