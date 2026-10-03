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
}: StatusToggleProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label htmlFor={`${id}-active`}>{label}</Label> : null}

      <div
        role="radiogroup"
        aria-label={label || 'Status'}
        aria-disabled={disabled}
        className={cn(
          'inline-flex w-full rounded-full border border-slate-200/80 bg-white p-1 shadow-sm sm:w-auto',
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
              ? 'bg-[#253CA1] text-white shadow-sm shadow-[#253CA1]/20'
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
              ? 'bg-slate-700 text-white shadow-sm shadow-slate-700/20'
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
