import { useId, useState, type ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import { BRAND_CHART } from './dashboard-palette'

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
  color = BRAND_CHART.brand300,
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
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Smooth area chart with a hover crosshair and tooltip. */
export function DashboardAreaChart({
  data,
  color = BRAND_CHART.brand500,
  formatTick,
  className,
}: {
  data: ChartDatum[]
  color?: string
  formatTick?: (value: number) => string
  className?: string
}) {
  const gradientId = gradientSafeId(useId())
  const [hovered, setHovered] = useState<number | null>(null)
  const width = 640
  const height = 220
  const padX = 12
  const padTop = 18
  const padBottom = 18
  const values = data.map((item) => item.value)
  const max = Math.max(...values, 1)
  const points = toPoints(values, width, height, padX, padTop, padBottom)
  const line = smoothLine(points)
  const area = points.length
    ? `${line} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`
    : ''
  const hasData = values.some((value) => value > 0)
  const tick = formatTick ?? String
  const last = points.length - 1
  const active = hovered ?? last
  const activePoint = points[active]

  if (!hasData) return null

  return (
    <div className={cn('relative flex flex-col justify-end', className)}>
      <div className="relative mt-6 h-[220px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-2.5 text-[11px] font-medium text-slate-400 tabular-nums">
          <span>{tick(max)}</span>
          <span>{tick(Math.round(max / 2))}</span>
          <span>0</span>
        </div>
        <div className="relative ml-12 h-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[220px] w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Trend: ${data.map((item) => `${item.label} ${tick(item.value)}`).join(', ')}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((lineY) => (
              <line
                key={lineY}
                x1={0}
                x2={width}
                y1={padTop + (height - padTop - padBottom) * lineY}
                y2={padTop + (height - padTop - padBottom) * lineY}
                stroke={BRAND_CHART.canvas}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {activePoint ? (
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={padTop}
                y2={height - padBottom}
                stroke={BRAND_CHART.brand200}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {activePoint ? (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
                style={{
                  left: `${(activePoint.x / width) * 100}%`,
                  top: `${(activePoint.y / height) * 220}px`,
                  backgroundColor: color,
                }}
              />
              <span
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white tabular-nums shadow-md"
                style={{
                  left: `${Math.min(Math.max((activePoint.x / width) * 100, 12), 88)}%`,
                  top: `${(activePoint.y / height) * 220 - 12}px`,
                }}
              >
                {data[active]?.label} · {tick(data[active]?.value ?? 0)}
              </span>
            </>
          ) : null}

          <div className="absolute inset-0 flex" onMouseLeave={() => setHovered(null)}>
            {data.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className="h-full flex-1 cursor-crosshair focus:outline-none"
                aria-label={`${item.label}: ${tick(item.value)}`}
                onMouseEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 ml-12 flex justify-between text-[11px] font-medium text-slate-400">
        {data.map((item, index) => (
          <span
            key={item.label}
            className={cn(
              'min-w-0 truncate text-center',
              index === active && 'font-semibold text-ink',
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Rounded pill columns on a soft track; hover shows the exact value. */
export function DashboardColumnChart({
  data,
  formatValue,
  barClassName = 'bg-brand-500',
  mutedBarClassName = 'bg-brand-200',
  highlightBarClassName = 'bg-brand-500',
  highlightIndex,
  showValueOnHighlight = false,
  inverted = false,
  className,
}: {
  data: ChartDatum[]
  formatValue?: (value: number) => string
  barClassName?: string
  mutedBarClassName?: string
  highlightBarClassName?: string
  /** When set, only this bar uses the primary/highlight color; others use muted. */
  highlightIndex?: number
  showValueOnHighlight?: boolean
  /** For use on a dark card. */
  inverted?: boolean
  className?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data.map((item) => item.value), 1)
  const hasData = data.some((item) => item.value > 0)
  const resolvedHighlight =
    highlightIndex ??
    data.reduce(
      (best, item, index) =>
        item.value > (data[best]?.value ?? -1) ? index : best,
      0,
    )
  const format = (value: number) => formatValue?.(value) ?? String(value)

  if (data.length === 0) return null

  return (
    <div className={cn('flex min-h-[260px] flex-1 flex-col', className)}>
      <div
        className="flex h-[220px] items-end gap-1.5 sm:gap-3"
        onMouseLeave={() => setHovered(null)}
      >
        {data.map((item, index) => {
          const height = hasData
            ? Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)
            : 0
          const isHighlighted =
            hasData &&
            (highlightIndex != null || showValueOnHighlight
              ? index === resolvedHighlight
              : true)
          const showLabel =
            hasData &&
            item.value > 0 &&
            (hovered === index ||
              (hovered == null && (!showValueOnHighlight || isHighlighted)))

          return (
            <button
              key={item.label}
              type="button"
              aria-label={`${item.label}: ${format(item.value)}`}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              className="group flex h-full min-w-0 flex-1 cursor-default flex-col items-center justify-end focus:outline-none"
            >
              <span
                className={cn(
                  'mb-1.5 h-6 rounded-full px-2 text-[11px] leading-6 font-semibold whitespace-nowrap tabular-nums transition',
                  !showLabel && 'invisible',
                  isHighlighted && showValueOnHighlight
                    ? inverted
                      ? 'bg-white text-ink'
                      : 'bg-ink text-white shadow-sm'
                    : inverted
                      ? 'text-white/70'
                      : 'text-slate-500',
                )}
              >
                {format(item.value)}
              </span>
              <div
                className={cn(
                  'relative flex min-h-0 w-full max-w-9 flex-1 items-end overflow-hidden rounded-full sm:w-[62%]',
                  inverted ? 'bg-white/8' : 'bg-canvas',
                  'group-focus-visible:ring-2 group-focus-visible:ring-brand-300',
                )}
              >
                <div
                  className={cn(
                    'w-full rounded-full transition-all duration-700 ease-out',
                    !hasData
                      ? 'bg-transparent'
                      : highlightIndex != null
                        ? isHighlighted
                          ? highlightBarClassName
                          : mutedBarClassName
                        : barClassName,
                    hovered === index && 'brightness-110',
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-3">
        {data.map((item, index) => (
          <span
            key={item.label}
            className={cn(
              'min-w-0 flex-1 truncate text-center text-[11px] font-medium',
              hasData && highlightIndex != null && index === resolvedHighlight
                ? inverted
                  ? 'font-semibold text-white'
                  : 'font-semibold text-ink'
                : inverted
                  ? 'text-white/55'
                  : 'text-slate-400',
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Horizontal paired bars per item with a legend. */
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
    <div className={cn('flex flex-1 flex-col gap-3', className)}>
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
        {series.map((entry) => (
          <span key={entry.key} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-full', entry.className)} />
            {entry.label}
          </span>
        ))}
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="rounded-2xl bg-canvas/70 px-3.5 py-3">
            <p className="truncate text-sm font-semibold text-ink">{item.label}</p>
            <div className="mt-2 space-y-1.5">
              {series.map((entry) => {
                const value = item.values[entry.key] ?? 0
                const width = Math.max((value / max) * 100, value > 0 ? 4 : 0)

                return (
                  <div
                    key={entry.key}
                    className="flex items-center gap-2"
                    title={`${entry.label}: ${value}`}
                  >
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out',
                          entry.className,
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-600 tabular-nums">
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Ring chart with a 2px gap between segments and hover titles. */
export function DashboardDonutChart({
  segments,
  size = 168,
  strokeWidth = 18,
  centerValue,
  centerLabel,
  trackColor = BRAND_CHART.canvas,
  inverted = false,
  className,
}: {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  centerValue?: ReactNode
  centerLabel?: string
  trackColor?: string
  inverted?: boolean
  className?: string
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const gap =
    total > 0 && segments.filter((item) => item.value > 0).length > 1 ? 3 : 0
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
        role="img"
        aria-label={segments
          .map((segment) => `${segment.label} ${segment.value}`)
          .join(', ')}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {total > 0
          ? segments.map((segment) => {
              if (segment.value <= 0) return null
              const length = (segment.value / total) * circumference - gap
              const share = Math.round((segment.value / total) * 100)
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
                  className="transition-opacity hover:opacity-80"
                >
                  <title>{`${segment.label}: ${segment.value} (${share}%)`}</title>
                </circle>
              )
              offset += (segment.value / total) * circumference
              return circle
            })
          : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerValue != null ? (
          <p
            className={cn(
              'text-2xl font-bold tracking-tight tabular-nums',
              inverted ? 'text-white' : 'text-ink',
            )}
          >
            {centerValue}
          </p>
        ) : null}
        {centerLabel ? (
          <p
            className={cn(
              'mt-0.5 max-w-[6.5rem] text-[11px] font-medium',
              inverted ? 'text-white/60' : 'text-slate-500',
            )}
          >
            {centerLabel}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Single-value ring gauge (0–100%). */
export function DashboardGauge({
  value,
  size = 112,
  strokeWidth = 10,
  color = BRAND_CHART.brand500,
  trackColor,
  label,
  emptyLabel = '—',
  inverted = false,
  className,
}: {
  value: number | null
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  emptyLabel?: string
  inverted?: boolean
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = value == null ? 0 : Math.min(Math.max(value, 0), 100)
  const track =
    trackColor ?? (inverted ? 'rgba(255,255,255,0.12)' : BRAND_CHART.brand100)
  const display =
    value == null ? emptyLabel : `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`

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
        role="img"
        aria-label={`${label ?? 'Progress'}: ${display}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        {pct > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p
          className={cn(
            'font-bold tracking-tight tabular-nums',
            size >= 100 ? 'text-2xl' : 'text-base',
            inverted ? 'text-white' : 'text-ink',
          )}
        >
          {display}
        </p>
        {label ? (
          <p
            className={cn(
              'mt-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase',
              inverted ? 'text-white/55' : 'text-slate-400',
            )}
          >
            {label}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Tapered stage bars; each row shows its count and share. */
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
    <div className={cn('flex w-full flex-1 flex-col justify-center gap-2', className)}>
      {items.map((item) => {
        const width = 44 + (item.value / max) * 56
        const share = total > 0 ? Math.round((item.value / total) * 100) : 0

        return (
          <div
            key={item.label}
            className="flex items-center gap-3"
            title={`${item.label}: ${item.value} (${share}%)`}
          >
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'flex h-11 items-center justify-between gap-2 rounded-full px-4 text-white transition-all duration-700 ease-out',
                  item.tone,
                )}
                style={{ width: `${width}%` }}
              >
                <span className="truncate text-xs font-semibold">{item.label}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {item.value}
                </span>
              </div>
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-500 tabular-nums">
              {share}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
