import { Link } from '@tanstack/react-router'
import { Building2, CalendarDays, FileImage, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'

import { DataTableBadge } from '../../../shared/components/data-table'
import {
  formatCurrencyAmount,
  parseCurrencyValue,
} from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import { getStudentInitials } from '../../students/api/students-api'
import { useLinkedPredictionTestQuery } from '../hooks/use-linked-prediction-test-query'
import { PaymentProgress } from './student-payment-terms-fields'
import {
  livePlanStatus,
  planStatusLabel,
  planStatusTone,
  remainingLabel,
  summarizeFormCollection,
  termStatusLabel,
  termStatusTone,
} from '../lib/payment-display'
import type {
  StudentPaymentFormValues,
  StudentPaymentListItem,
} from '../types/student-payment'

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function StudentPaymentDetailHero({
  payment,
  values,
}: {
  payment: StudentPaymentListItem
  values: StudentPaymentFormValues
}) {
  const summary = summarizeFormCollection(values.fullAmount, values.terms)
  const status = livePlanStatus(summary.planned, summary.approved)
  const remainingValue = Math.abs(summary.remaining)
  const linkedPredictionQuery = useLinkedPredictionTestQuery({
    studentId: values.studentId || payment.studentId || '',
    prospectiveStudentId:
      values.prospectiveStudentId || payment.prospectiveStudentId || '',
    fullAmount: values.fullAmount,
    paymentId: payment.id,
  })
  const linkedPredictionTestAmount =
    linkedPredictionQuery.data?.linkedPredictionTestAmount ??
    payment.linkedPredictionTestAmount
  const commissionBaseAmount =
    linkedPredictionQuery.data?.commissionBaseAmount ??
    summary.planned + linkedPredictionTestAmount

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-[1.75rem] border border-[#D7E4F6] bg-[linear-gradient(135deg,#F5F8FF_0%,#FFFFFF_42%,#E8EEFF_100%)] shadow-[0_24px_48px_-28px_rgba(66,116,185,0.35)]">
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(66,116,185,0.22),transparent_70%)]" />
              <div className="relative inline-flex size-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-2xl font-bold tracking-wide text-white shadow-lg shadow-[#253CA1]/30 sm:size-24">
                {getStudentInitials(payment.studentName)}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#253CA1] uppercase ring-1 ring-[#C8D4F5]">
                  {payment.studentPin ||
                    (payment.prospectiveStudentId ? 'Prospect' : 'Plan')}
                </span>
                <DataTableBadge tone={planStatusTone(status)}>
                  {planStatusLabel(status)}
                </DataTableBadge>
              </div>
              <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {values.title.trim() || payment.title || 'Payment plan'}
              </h2>
              {payment.studentId ? (
                <Link
                  to="/students/$studentId"
                  params={{ studentId: payment.studentId }}
                  className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
                >
                  <UserRound className="size-3.5 shrink-0" />
                  <span className="truncate">{payment.studentName}</span>
                </Link>
              ) : payment.prospectiveStudentId ? (
                <Link
                  to="/prospective-students/$prospectiveStudentId/edit"
                  params={{
                    prospectiveStudentId: payment.prospectiveStudentId,
                  }}
                  className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
                >
                  <UserRound className="size-3.5 shrink-0" />
                  <span className="truncate">{payment.studentName}</span>
                </Link>
              ) : (
                <p className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-slate-700">
                  <UserRound className="size-3.5 shrink-0" />
                  <span className="truncate">{payment.studentName}</span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-[#253CA1]" />
                  {payment.branch}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-[#253CA1]" />
                  Created {formatDate(payment.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroMetric
            label="Collected"
            value={formatCurrencyAmount(summary.approved)}
            hint={`${summary.approvedCount} approved installment${summary.approvedCount === 1 ? '' : 's'}`}
          />
          <HeroMetric
            label={remainingLabel(summary.remaining)}
            value={formatCurrencyAmount(remainingValue)}
            hint={
              summary.remaining > 0
                ? 'Still needed to complete the plan'
                : summary.remaining < 0
                  ? 'Approved amount is above the plan'
                  : 'Approved installments cover the plan'
            }
            tone={
              summary.remaining > 0
                ? 'warning'
                : summary.remaining < 0
                  ? 'danger'
                  : 'success'
            }
          />
          <HeroMetric
            label="Planned"
            value={formatCurrencyAmount(summary.planned)}
            hint={`${values.terms.length} installment${values.terms.length === 1 ? '' : 's'} on this plan`}
          />
          {linkedPredictionTestAmount > 0 ? (
            <HeroMetric
              label="Pretest + plan"
              value={formatCurrencyAmount(commissionBaseAmount)}
              hint={`Includes ${formatCurrencyAmount(linkedPredictionTestAmount)} pretest (once per person)`}
            />
          ) : null}
        </div>

        <PaymentProgress
          paidAmount={summary.approved}
          fullAmount={summary.planned}
          size="lg"
        />
      </div>
    </section>
  )
}

function HeroMetric({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: string
  hint: string
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
}) {
  return (
    <div className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-white/80">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-lg font-bold tracking-tight tabular-nums',
          tone === 'warning' && 'text-amber-700',
          tone === 'danger' && 'text-rose-700',
          tone === 'success' && 'text-emerald-700',
          tone === 'neutral' && 'text-slate-900',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export function StudentPaymentDetailAside({
  payment,
  values,
}: {
  payment: StudentPaymentListItem
  values: StudentPaymentFormValues
}) {
  const summary = summarizeFormCollection(values.fullAmount, values.terms)
  const linkedPredictionQuery = useLinkedPredictionTestQuery({
    studentId: values.studentId || payment.studentId || '',
    prospectiveStudentId:
      values.prospectiveStudentId || payment.prospectiveStudentId || '',
    fullAmount: values.fullAmount,
    paymentId: payment.id,
  })
  const linkedPredictionTestAmount =
    linkedPredictionQuery.data?.linkedPredictionTestAmount ??
    payment.linkedPredictionTestAmount
  const commissionBaseAmount =
    linkedPredictionQuery.data?.commissionBaseAmount ??
    parseCurrencyValue(values.fullAmount) + linkedPredictionTestAmount
  const predictionClaimedElsewhere =
    linkedPredictionQuery.data?.predictionClaimedElsewhere ??
    payment.predictionClaimedElsewhere
  const proofs = values.terms.flatMap((formTerm, index) => {
    if (!formTerm.id) return []
    const saved = payment.terms.find((term) => term.id === formTerm.id)
    if (!saved) return []
    return saved.attachments.map((attachment) => ({
      ...attachment,
      installment: index + 1,
      status: saved.status,
    }))
  })

  return (
    <aside className="animate-in fade-in slide-in-from-bottom-2 delay-100 space-y-5 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-slate-900">Plan details</h3>
        <p className="mt-1 text-sm text-slate-500">
          Record metadata and attached proofs.
        </p>
      </div>

      <dl className="space-y-4">
        <AsideItem label={payment.studentId ? 'Student' : 'Prospective student'}>
          {payment.studentId ? (
            <Link
              to="/students/$studentId"
              params={{ studentId: payment.studentId }}
              className="font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
            >
              {payment.studentPin
                ? `${payment.studentPin} · ${payment.studentName}`
                : payment.studentName}
            </Link>
          ) : payment.prospectiveStudentId ? (
            <Link
              to="/prospective-students/$prospectiveStudentId/edit"
              params={{
                prospectiveStudentId: payment.prospectiveStudentId,
              }}
              className="font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
            >
              {payment.studentName}
            </Link>
          ) : (
            <span className="font-semibold text-slate-700">
              {payment.studentName}
            </span>
          )}
        </AsideItem>
        <AsideItem label="Branches" value={payment.branch} />
        <AsideItem label="Created by" value={payment.createdBy} />
        <AsideItem label="Created" value={formatDateTime(payment.createdAt)} />
      </dl>

      {linkedPredictionTestAmount > 0 ? (
        <>
          <div className="h-px bg-slate-100" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Linked pretest
            </p>
            <p className="mt-2 text-lg font-bold tabular-nums text-[#1B2A5A]">
              {formatCurrencyAmount(linkedPredictionTestAmount)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Commission base{' '}
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatCurrencyAmount(commissionBaseAmount)}
              </span>
              {' '}(first completed plan only)
            </p>
          </div>
        </>
      ) : predictionClaimedElsewhere ? (
        <>
          <div className="h-px bg-slate-100" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Linked pretest
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Already claimed by another plan for marketer commission.
            </p>
          </div>
        </>
      ) : null}

      <div className="h-px bg-slate-100" />

      <div>
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Installment mix
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {summary.approvedCount > 0 ? (
            <DataTableBadge tone="success">
              {summary.approvedCount} approved
            </DataTableBadge>
          ) : null}
          {summary.pendingCount > 0 ? (
            <DataTableBadge tone="info">
              {summary.pendingCount} pending
            </DataTableBadge>
          ) : null}
          {summary.voidCount > 0 ? (
            <DataTableBadge tone="danger">{summary.voidCount} void</DataTableBadge>
          ) : null}
          {summary.approvedCount + summary.pendingCount + summary.voidCount ===
          0 ? (
            <span className="text-sm text-slate-500">No installments yet</span>
          ) : null}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div>
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Payment proofs
        </p>
        {proofs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No proof files have been uploaded for this plan.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {proofs.map((proof) => (
              <li key={proof.id}>
                <a
                  href={proof.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF]"
                >
                  <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-[#1B2A5A]">
                    <FileImage className="size-3.5 shrink-0" />
                    <span className="truncate">
                      Installment {proof.installment}
                    </span>
                  </span>
                  <DataTableBadge tone={termStatusTone(proof.status)}>
                    {termStatusLabel(proof.status)}
                  </DataTableBadge>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

function AsideItem({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold tracking-tight text-slate-900">
        {children ?? value ?? '—'}
      </dd>
    </div>
  )
}
