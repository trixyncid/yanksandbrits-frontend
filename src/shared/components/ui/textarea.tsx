import type { TextareaHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-28 w-full rounded-[1.75rem] border border-slate-200/80 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm',
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
