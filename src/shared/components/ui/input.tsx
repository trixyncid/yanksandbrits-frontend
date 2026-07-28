import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4274B9] focus:outline-none focus:ring-2 focus:ring-[#4274B9]/15 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
