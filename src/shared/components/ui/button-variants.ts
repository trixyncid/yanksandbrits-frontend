import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600',
        secondary:
          'bg-white text-ink ring-1 ring-slate-200/80 hover:bg-canvas',
        ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
        ink: 'bg-ink text-white shadow-sm hover:bg-ink-soft focus-visible:ring-ink/30',
        soft: 'bg-canvas text-ink hover:bg-canvas-deep',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-5',
        lg: 'h-12 px-6',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)
