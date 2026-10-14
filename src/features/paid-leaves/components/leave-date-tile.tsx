/** Small calendar tile: month on top, day underneath. */
export function LeaveDateTile({ value }: { value: string }) {
  const date = new Date(value)
  return (
    <span className="inline-flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-xl bg-canvas text-center">
      <span className="w-full bg-brand-500 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
        {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}
      </span>
      <span className="py-0.5 text-sm font-bold text-ink tabular-nums">
        {date.getDate()}
      </span>
    </span>
  )
}
