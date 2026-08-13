import { Link } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'

import { buttonVariants } from '../../../shared/components/ui/button'
import { getDefaultStaffPath } from '../../auth/lib/route-access'
import { useAuthStore } from '../../auth/store/auth-store'
import { AdminShell } from '../components/admin-shell'

export default function ForbiddenPage() {
  const user = useAuthStore((state) => state.user)
  const fallback = getDefaultStaffPath(user)

  return (
    <AdminShell>
      <div className="mx-auto max-w-lg rounded-[1.5rem] border border-rose-100 bg-white px-8 py-12 text-center shadow-sm">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          You don&apos;t have permission to view this page. Contact an
          administrator if you need access.
        </p>
        <Link
          to={fallback}
          className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'mt-6' })}
        >
          Go to your home page
        </Link>
      </div>
    </AdminShell>
  )
}
