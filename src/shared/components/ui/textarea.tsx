import type { TextareaHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-28 w-full rounded-[1.75rem] border border-transparent bg-canvas/70 px-4 py-3.5 text-sm font-medium text-slate-800 ',
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
