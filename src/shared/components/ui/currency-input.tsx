import { useLayoutEffect, useRef, type InputHTMLAttributes } from 'react'

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

/** Trailing ",50" / ".00" on pasted amounts are cents, not extra digits (IDR has none). */
const DECIMAL_SUFFIX = /[.,]\d{1,2}\s*$/

/** Index in `text` just after its `count`-th digit. */
function caretAfterDigits(text: string, count: number) {
  if (count <= 0) return 0
  let seen = 0
  for (let index = 0; index < text.length; index += 1) {
    if (/\d/.test(text[index]) && ++seen === count) return index + 1
  }
  return text.length
}

export function CurrencyInput({
  value,
  onValueChange,
  currencySymbol = 'Rp',
  className,
  placeholder = '0',
  onPaste,
  ...props
}: CurrencyInputProps) {
  const displayValue = formatCurrencyDigits(value)
  const inputRef = useRef<HTMLInputElement>(null)
  // Digits left of the caret, restored after reformatting so edits mid-number don't jump to the end.
  const pendingCaret = useRef<number | null>(null)

  useLayoutEffect(() => {
    const input = inputRef.current
    if (pendingCaret.current == null || !input || document.activeElement !== input) return
    const position = caretAfterDigits(input.value, pendingCaret.current)
    pendingCaret.current = null
    input.setSelectionRange(position, position)
  })

  function commit(raw: string, caretRaw: string) {
    pendingCaret.current = parseCurrencyDigits(caretRaw).length
    onValueChange(parseCurrencyDigits(raw))
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-slate-500">
        {currencySymbol}
      </span>
      <input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => {
          const { value: raw, selectionStart } = event.target
          commit(raw, raw.slice(0, selectionStart ?? raw.length))
        }}
        onPaste={(event) => {
          onPaste?.(event)
          const pasted = event.clipboardData.getData('text')
          if (event.defaultPrevented || !DECIMAL_SUFFIX.test(pasted)) return
          event.preventDefault()
          const input = event.currentTarget
          const before = input.value.slice(0, input.selectionStart ?? input.value.length)
          const after = input.value.slice(input.selectionEnd ?? input.value.length)
          const inserted = pasted.replace(DECIMAL_SUFFIX, '')
          commit(before + inserted + after, before + inserted)
        }}
        className={cn(
          'flex h-12 w-full rounded-full border border-transparent bg-canvas/70 py-0 pr-4 pl-11 text-sm font-semibold tabular-nums text-slate-800 ',
          'placeholder:font-medium placeholder:text-slate-400',
          'transition-colors hover:bg-canvas',
          'focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      />
    </div>
  )
}
