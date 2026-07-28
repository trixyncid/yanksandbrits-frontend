const highlights = [
  {
    title: 'Operational visibility',
    description:
      'A focused admin entry point for schedules, finance, branch operations, and staff workflows.',
  },
  {
    title: 'Ready for incremental migration',
    description:
      'This frontend can replace the old Django-rendered pages step by step without blocking future API work.',
  },
  {
    title: 'Structured for maintainability',
    description:
      'Separated routes, features, services, and shared UI keep debugging and future extension manageable.',
  },
]

export function LoginHighlights() {
  return (
    <div className="space-y-5">
      {highlights.map((highlight) => (
        <div
          key={highlight.title}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <h3 className="text-sm font-semibold text-white">{highlight.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {highlight.description}
          </p>
        </div>
      ))}
    </div>
  )
}
