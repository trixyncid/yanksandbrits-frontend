export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-6 text-slate-900">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-lg shadow-slate-200/70">
        <span className="size-2.5 animate-pulse rounded-full bg-[#4274B9]" />
        <span className="text-sm font-medium tracking-wide text-slate-700">
          Loading admin workspace...
        </span>
      </div>
    </div>
  )
}
