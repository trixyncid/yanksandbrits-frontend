export function AppLoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-6 text-ink"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div className="relative flex flex-col items-center animate-in fade-in">
        <div className="relative flex size-36 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-brand-100 [animation-duration:2s]"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-white shadow-[0_24px_48px_-24px_rgba(20,27,58,0.35)]"
          />
          <img
            src="/logo.svg"
            alt="Yanks and Brits"
            className="relative h-20 w-auto object-contain"
          />
        </div>
        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-2 animate-bounce rounded-full bg-brand-500"
              style={{ animationDelay: `${dot * 120}ms` }}
            />
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">
          Getting things ready...
        </p>
      </div>
    </div>
  )
}
