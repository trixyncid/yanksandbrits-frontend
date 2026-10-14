/**
 * Brand-derived hero themes. Each section of the app picks one so pages feel
 * related (same logo blue and grey) without looking identical.
 */
export type PageTheme = 'harbor' | 'sky' | 'dusk' | 'mist' | 'ink' | 'dawn'

/** Decorative line work drawn over the theme gradient. */
export type PagePattern = 'arcs' | 'waves' | 'dots' | 'rings' | 'grid' | 'ribbons'

export const THEMES: Record<
  PageTheme,
  { background: string; glow: string; line: string; dark: boolean }
> = {
  // Deep logo blue fading to a pale sky.
  harbor: {
    background:
      'bg-[linear-gradient(118deg,#0F1840_0%,#1A2A71_34%,#253CA1_66%,#8C9DDD_100%)]',
    glow: 'bg-brand-300/40',
    line: 'text-white/20',
    dark: true,
  },
  // Airy and light; dark text.
  sky: {
    background:
      'bg-[linear-gradient(135deg,#EEF1FB_0%,#DCE2F6_40%,#B9C4EC_75%,#8C9DDD_100%)]',
    glow: 'bg-white/70',
    line: 'text-brand-500/15',
    dark: false,
  },
  // Navy into the logo grey, for money and reports.
  dusk: {
    background:
      'bg-[linear-gradient(125deg,#141B3A_0%,#222B52_38%,#5C6382_72%,#929499_100%)]',
    glow: 'bg-brand-400/30',
    line: 'text-white/15',
    dark: true,
  },
  // Silver-blue, quiet; dark text.
  mist: {
    background:
      'bg-[linear-gradient(140deg,#F4F5F7_0%,#E7E8EA_35%,#DDE2F0_70%,#B9C4EC_100%)]',
    glow: 'bg-white/80',
    line: 'text-brand-gray/25',
    dark: false,
  },
  // Solid navy with a blue bloom, for access and settings.
  ink: {
    background:
      'bg-[radial-gradient(120%_140%_at_85%_10%,#253CA1_0%,#15225A_38%,#141B3A_70%)]',
    glow: 'bg-brand-500/30',
    line: 'text-white/12',
    dark: true,
  },
  // Morning light: pale blue with a warm grey edge.
  dawn: {
    background:
      'bg-[linear-gradient(160deg,#FFFFFF_0%,#EEF1FB_30%,#DCE2F6_60%,#E7E8EA_100%)]',
    glow: 'bg-brand-200/50',
    line: 'text-brand-400/20',
    dark: false,
  },
}

export function isDarkTheme(theme: PageTheme) {
  return THEMES[theme].dark
}
