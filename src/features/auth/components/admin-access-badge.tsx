import { ShieldCheck } from 'lucide-react'

export function AdminAccessBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-white uppercase backdrop-blur-md">
      <ShieldCheck className="size-3.5" />
      Staff portal
    </div>
  )
}
