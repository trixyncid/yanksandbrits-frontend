import type { InputHTMLAttributes } from 'react'

import {
  formatCurrencyDigits,
  parseCurrencyDigits,
} from '../../lib/currency'
import { cn } from '../../lib/cn'

type CurrencyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  value: string
  onValueChange: (digits: string) => void
  currencySymbol?: string
}

export function CurrencyInput({
  value,
  onValueChange,
  currencySymbol = 'Rp',
  className,
  placeholder = '0',
  ...props
}: CurrencyInputProps) {
  const displayValue = formatCurrencyDigits(value)

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-slate-500">
        {currencySymbol}
      </span>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => {
          onValueChange(parseCurrencyDigits(event.target.value))
        }}
        className={cn(
          'flex h-12 w-full rounded-full border border-slate-200/80 bg-white py-0 pr-4 pl-11 text-sm font-semibold tabular-nums text-slate-800 shadow-sm',
          'placeholder:font-medium placeholder:text-slate-400',
          'transition-colors hover:border-slate-300',
          'focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#253CA1]/20',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      />
    </div>
  )
}
