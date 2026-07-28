import { ShieldCheck } from 'lucide-react'

export function AdminAccessBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
      <ShieldCheck className="size-3.5" />
      Admin Access Only
    </div>
  )
}
