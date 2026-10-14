import { cn } from '../../lib/cn'

/** "Supported by Trixync" credit with the Trixync wordmark. */
export function SupportedBy({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-[11px] font-medium text-slate-400',
        className,
      )}
    >
      Supported by
      <a
        href="https://trixync.id"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Trixync (opens in a new tab)"
        title="trixync.id"
        className="inline-flex rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none"
      >
        <img src="/trixync-logo.svg" alt="Trixync" className="h-2.5 w-auto" />
      </a>
    </p>
  )
}
