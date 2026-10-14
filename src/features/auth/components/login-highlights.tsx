import { BriefcaseBusiness, CalendarDays, GraduationCap, type LucideIcon } from 'lucide-react'

const highlights: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: CalendarDays,
    title: 'Your schedule',
    description: 'Classes, rooms and sessions for the week ahead.',
  },
  {
    icon: GraduationCap,
    title: 'Your students',
    description: 'Leads, tests, enrolments and progress.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Your work',
    description: 'Payments, reports, leave and pay, based on your role.',
  },
]

export function LoginHighlights() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {highlights.map((highlight, index) => {
        const Icon = highlight.icon
        return (
          <li
            key={highlight.title}
            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-md"
            style={{ animationDelay: `${150 + index * 80}ms` }}
          >
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-brand-600">
              <Icon className="size-4" strokeWidth={1.9} />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-white">
              {highlight.title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-white/75">
              {highlight.description}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
