import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70',
        className,
      )}
      {...props}
    />
  )
}
