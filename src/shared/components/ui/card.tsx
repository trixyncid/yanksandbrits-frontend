import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] bg-white shadow-[0_1px_2px_rgba(20,27,58,0.04)]',
        className,
      )}
      {...props}
    />
  )
}
