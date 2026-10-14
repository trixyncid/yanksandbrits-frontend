import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Compass, Home } from 'lucide-react'

import { PageBackdrop } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { getDefaultStaffPath } from '../../auth/lib/route-access'
import { useAuthStore } from '../../auth/store/auth-store'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const homeTo = isAuthenticated ? getDefaultStaffPath(user) : '/login'
  const homeLabel = isAuthenticated ? 'Go to home' : 'Go to login'

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 text-ink">
      <PageBackdrop theme="sky" pattern="rings" />
      <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 text-center">
        <img
          src="/logo.svg"
          alt="Yanks and Brits"
          className="mx-auto h-14 w-auto object-contain"
        />
        <p
          aria-hidden
          className="mt-6 text-[7rem] leading-none font-bold tracking-tighter text-brand-500/15 select-none sm:text-[9rem]"
        >
          404
        </p>
        <div className="-mt-10 rounded-[1.75rem] bg-white p-8 shadow-[0_32px_64px_-32px_rgba(20,27,58,0.45)] sm:-mt-14">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Compass className="size-6" strokeWidth={1.8} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
            We can't find that page
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            It may have been moved, or the link has a typo. Let's get you back
            on track.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => void navigate({ to: homeTo })}>
              <Home className="size-4" />
              {homeLabel}
            </Button>
            <Button variant="soft" onClick={() => window.history.back()}>
              <ArrowLeft className="size-4" />
              Go back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
