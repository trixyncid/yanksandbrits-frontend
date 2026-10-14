import { cn } from '../../lib/cn'
import { THEMES, type PagePattern, type PageTheme } from './page-themes'

function Pattern({ pattern }: { pattern: PagePattern }) {
  switch (pattern) {
    case 'arcs':
      return (
        <svg
          className="absolute -right-24 -bottom-40 h-[34rem] w-[46rem]"
          viewBox="0 0 600 440"
          fill="none"
        >
          {Array.from({ length: 14 }).map((_, index) => (
            <ellipse
              key={index}
              cx="380"
              cy="300"
              rx={120 + index * 22}
              ry={60 + index * 14}
              stroke="currentColor"
              strokeWidth="1.2"
              transform={`rotate(${-18 + index * 1.5} 380 300)`}
            />
          ))}
        </svg>
      )
    case 'waves':
      return (
        <svg
          className="absolute inset-x-0 bottom-0 h-3/4 w-full"
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
          fill="none"
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <path
              key={index}
              d={`M0 ${200 - index * 16} C 200 ${120 - index * 14}, 420 ${260 - index * 18}, 800 ${140 - index * 12}`}
              stroke="currentColor"
              strokeWidth="1.4"
            />
          ))}
        </svg>
      )
    case 'dots':
      return (
        <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(currentColor_1.2px,transparent_1.2px)] [background-size:18px_18px] [mask-image:linear-gradient(90deg,transparent,black_60%)]" />
      )
    case 'rings':
      return (
        <svg
          className="absolute -top-24 -right-16 size-[30rem]"
          viewBox="0 0 400 400"
          fill="none"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <circle
              key={index}
              cx="260"
              cy="140"
              r={40 + index * 26}
              stroke="currentColor"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      )
    case 'grid':
      return (
        <div className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(70%_90%_at_80%_20%,black,transparent)]" />
      )
    case 'ribbons':
      return (
        <svg
          className="absolute -right-10 -bottom-24 h-[26rem] w-[40rem]"
          viewBox="0 0 640 400"
          fill="none"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <path
              key={index}
              d={`M${40 + index * 30} 380 C ${180 + index * 20} ${80 - index * 10}, ${420 - index * 10} ${360 - index * 20}, ${620} ${40 + index * 30}`}
              stroke="currentColor"
              strokeWidth={10 - index}
              strokeLinecap="round"
              opacity={0.5 + index * 0.08}
            />
          ))}
        </svg>
      )
  }
}

export function PageBackdrop({
  theme,
  pattern,
  className,
}: {
  theme: PageTheme
  pattern: PagePattern
  className?: string
}) {
  const config = THEMES[theme]
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className={cn('absolute inset-0', config.background)} />
      <div
        className={cn(
          'absolute -top-24 left-1/3 size-[26rem] rounded-full blur-3xl',
          config.glow,
        )}
      />
      <div className={cn('absolute inset-0', config.line)}>
        <Pattern pattern={pattern} />
      </div>
    </div>
  )
}
