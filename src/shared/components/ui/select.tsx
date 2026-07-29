import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  containerClassName?: string
}

export function Select({
  className,
  containerClassName,
  children,
  ...props
}: SelectProps) {
  return (
    <div
      className={cn(
        'relative flex w-full min-w-44 sm:w-auto',
        containerClassName,
      )}
    >
      <select
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-slate-200 bg-[#F4F6FA] py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-colors',
          'hover:border-[#BED2F2] hover:bg-white',
          'focus:border-[#4274B9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4274B9]/15',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
}
