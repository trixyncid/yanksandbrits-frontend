import { format } from 'date-fns'
import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import {
  deriveStaffPosition,
  type UserDetail,
} from '../api/users-api'
import type { StaffEntityConfig } from '../lib/staff-entity-config'

export function formatStaffDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'MMM d, yyyy')
}

export function formatStaffDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'MMM d, yyyy · h:mm a')
}

export function formatStaffCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatStaffTime(value: string | null | undefined) {
  if (!value) return '—'
  return value.slice(0, 5)
}

export function staffPositionLabel(user: UserDetail) {
  if (user.position) return user.position
  const derived = deriveStaffPosition(user)
  return derived.charAt(0).toUpperCase() + derived.slice(1)
}

export function staffRoleBadges(user: UserDetail) {
  const roles: string[] = []
  if (user.isSuperuser) roles.push('Superuser')
  if (user.roles?.length) {
    for (const role of user.roles) {
      if (!roles.includes(role.name)) roles.push(role.name)
    }
  } else {
    if (user.isStudent) roles.push('Student')
    if (user.isManager) roles.push('Manager')
    if (user.isTutor) roles.push('Tutor')
    if (user.isMarketing) roles.push('Marketing')
  }
  if (roles.length === 0) roles.push('User')
  return roles
}

export function staffEditPath(entity: StaffEntityConfig, id: string) {
  if (entity.kind === 'staff') {
    return { to: '/users/$userId/edit' as const, params: { userId: id } }
  }
  if (entity.kind === 'tutor') {
    return { to: '/tutors/$tutorId/edit' as const, params: { tutorId: id } }
  }
  return {
    to: '/marketings/$marketingId/edit' as const,
    params: { marketingId: id },
  }
}

export function StaffDetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-base font-semibold tracking-tight text-slate-900">
        {value || '—'}
      </dd>
    </div>
  )
}

export function StaffDetailSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(className)}>
      <div className="mb-5">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
    </section>
  )
}
