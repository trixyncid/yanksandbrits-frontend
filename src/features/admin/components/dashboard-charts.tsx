import { useId, type ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'

export type ChartDatum = {
  label: string
  value: number
}

export type DonutSegment = {
  label: string
  value: number
  color: string
}

function smoothLine(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const midX = (current.x + next.x) / 2
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`
  }
  return path
}

function gradientSafeId(id: string) {
  return id.replace(/:/g, '')
}

function toPoints(
  values: number[],
  width: number,
  height: number,
  padX: number,
  padTop: number,
  padBottom = padTop,
) {
  const max = Math.max(...values, 1)
  const innerWidth = Math.max(width - padX * 2, 1)
  const innerHeight = Math.max(height - padTop - padBottom, 1)
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0

  return values.map((value, index) => ({
    x: padX + index * step,
    y: padTop + innerHeight - (value / max) * innerHeight,
  }))
}

export function DashboardSparkline({
  values,
  color = '#93B8E8',
  className,
}: {
  values: number[]
  color?: string
  className?: string
}) {
  const gradientId = gradientSafeId(useId())
  const width = 320
  const height = 72
  const points = toPoints(values, width, height, 4, 8)
  const line = smoothLine(points)
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : ''

  if (values.length === 0) return null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-16 w-full', className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DashboardAreaChart({
  data,
  color = '#4274B9',
  formatTick,
  className,
}: {
  data: ChartDatum[]
  color?: string
  formatTick?: (value: number) => string
  className?: string
}) {
  const gradientId = gradientSafeId(useId())
  const width = 640
  const height = 220
  const padX = 8
  const padTop = 18
  const padBottom = 28
  const values = data.map((item) => item.value)
  const max = Math.max(...values, 1)
  const points = toPoints(values, width, height, padX, padTop, padBottom)
  const line = smoothLine(points)
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`
    : ''
  const hasData = values.some((value) => value > 0)
  const tick = formatTick ?? String

  if (!hasData) return null

  return (
    <div className={cn('relative min-h-[260px] flex-1', className)}>
      <p className="mb-1 text-right text-[11px] font-semibold text-slate-400 tabular-nums">
        {tick(max)}
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((lineY) => (
          <line
            key={lineY}
            x1={padX}
            x2={width - padX}
            y1={padTop + (height - padTop - padBottom) * lineY}
            y2={padTop + (height - padTop - padBottom) * lineY}
            stroke="#E8EEF5"
            strokeDasharray="4 6"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.75"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] font-medium text-slate-400">
        {data.map((item) => (
          <span key={item.label} className="min-w-0 truncate text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DashboardColumnChart({
  data,
  formatValue,
  barClassName = 'bg-[#4274B9]',
  className,
}: {
  data: ChartDatum[]
  formatValue?: (value: number) => string
  barClassName?: string
  className?: string
}) {
  const max = Math.max(...data.map((item) => item.value), 1)
  const hasData = data.some((item) => item.value > 0)

  if (!hasData) return null

  return (
    <div className={cn('flex min-h-[260px] flex-1 flex-col', className)}>
      <p className="mb-1 text-right text-[11px] font-semibold text-slate-400 tabular-nums">
        {formatValue?.(max) ?? max}
      </p>
      <div className="flex h-[220px] items-end gap-2 sm:gap-3">
        {data.map((item) => {
          const height = Math.max((item.value / max) * 100, item.value > 0 ? 6 : 0)

          return (
            <div
              key={item.label}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="mb-1.5 text-[10px] font-semibold text-slate-500 tabular-nums">
                {item.value > 0 ? (formatValue?.(item.value) ?? item.value) : ''}
              </span>
              <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                <div
                  className={cn(
                    'w-[62%] max-w-10 rounded-t-md transition-all duration-500',
                    barClassName,
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex gap-2 sm:gap-3">
        {data.map((item) => (
          <span
            key={item.label}
            className="min-w-0 flex-1 truncate text-center text-[11px] font-medium text-slate-400"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DashboardGroupedColumns({
  items,
  series,
  className,
}: {
  items: { label: string; values: Record<string, number> }[]
  series: { key: string; label: string; className: string }[]
  className?: string
}) {
  const max = Math.max(
    ...items.flatMap((item) => series.map((entry) => item.values[entry.key] ?? 0)),
    1,
  )

  return (
    <div className={cn('flex-1 space-y-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <p className="truncate text-sm font-semibold text-slate-700">
            {item.label}
          </p>
          <div className="flex h-9 items-end gap-1.5">
            {series.map((entry) => {
              const value = item.values[entry.key] ?? 0
              const width = Math.max((value / max) * 100, value > 0 ? 8 : 0)

              return (
                <div key={entry.key} className="min-w-0 flex-1">
                  <div className="mb-1 text-right text-[10px] font-semibold text-slate-500 tabular-nums">
                    {value || ''}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full', entry.className)}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
        {series.map((entry) => (
          <span key={entry.key} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', entry.className)} />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DashboardDonutChart({
  segments,
  size = 168,
  strokeWidth = 18,
  centerValue,
  centerLabel,
  className,
}: {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerValue?: ReactNode
  centerLabel?: string
  className?: string
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const gap = total > 0 && segments.filter((item) => item.value > 0).length > 1 ? 3 : 0
  let offset = 0

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8EEF5"
          strokeWidth={strokeWidth}
        />
        {total > 0
          ? segments.map((segment) => {
              if (segment.value <= 0) return null
              const length = (segment.value / total) * circumference - gap
              const circle = (
                <circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${Math.max(length, 0)} ${circumference}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              )
              offset += (segment.value / total) * circumference
              return circle
            })
          : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerValue ? (
          <p className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {centerValue}
          </p>
        ) : null}
        {centerLabel ? (
          <p className="mt-0.5 max-w-[6.5rem] text-[11px] font-medium text-slate-400">
            {centerLabel}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function DashboardGauge({
  value,
  size = 112,
  strokeWidth = 10,
  color = '#4274B9',
  trackColor = '#E8EEF5',
  label,
  emptyLabel = '—',
  className,
}: {
  value: number | null
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  emptyLabel?: string
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = value == null ? 0 : Math.min(Math.max(value, 0), 100)

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value == null ? emptyLabel : `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`}
        </p>
        {label ? (
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
            {label}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function DashboardFunnelChart({
  items,
  className,
}: {
  items: { label: string; value: number; tone: string }[]
  className?: string
}) {
  const max = Math.max(...items.map((item) => item.value), 1)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={cn('w-full flex-1 space-y-2', className)}>
      {items.map((item, index) => {
        const countWidth = 58 + (item.value / max) * 42
        const taper = Math.max(countWidth - index * 1.5, 42)
        const share = total > 0 ? Math.round((item.value / total) * 100) : 0

        return (
          <div key={item.label} className="flex justify-center">
            <div
              className={cn(
                'flex h-10 items-center justify-between gap-3 rounded-lg px-3.5 text-white shadow-sm transition-all duration-500',
                item.tone,
              )}
              style={{ width: `${taper}%` }}
            >
              <span className="truncate text-xs font-semibold">{item.label}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums">
                {item.value}
                <span className="ml-1.5 font-medium text-white/70">{share}%</span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
