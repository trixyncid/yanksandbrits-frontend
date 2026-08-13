import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Home, SearchX } from 'lucide-react'

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
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-6 py-16 text-slate-900">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9] ring-1 ring-[#BED2F2]">
          <SearchX className="size-6" />
        </div>
        <p className="mt-5 text-sm font-semibold tracking-[0.14em] text-[#4274B9] uppercase">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The page you are looking for does not exist, was moved, or the link is
          incorrect.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={() => void navigate({ to: homeTo })}>
            <Home className="size-4" />
            {homeLabel}
          </Button>
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}
