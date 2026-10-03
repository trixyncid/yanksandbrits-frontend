import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-full border border-slate-200/80 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm',
        'placeholder:font-normal placeholder:text-slate-400',
        'transition-colors hover:border-slate-300',
        'focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#253CA1]/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
