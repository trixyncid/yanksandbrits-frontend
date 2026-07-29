import type { TextareaHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-28 w-full rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4274B9] focus:outline-none focus:ring-2 focus:ring-[#4274B9]/15 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
