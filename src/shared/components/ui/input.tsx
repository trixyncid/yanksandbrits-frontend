import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-full border border-transparent bg-canvas/70 px-4 text-sm font-medium text-slate-800 ',
        'placeholder:font-normal placeholder:text-slate-400',
        'transition-colors hover:bg-canvas',
        'focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
