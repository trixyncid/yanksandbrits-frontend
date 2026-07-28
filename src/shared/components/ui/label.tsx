import type { LabelHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-slate-700', className)}
      {...props}
    />
  )
}
