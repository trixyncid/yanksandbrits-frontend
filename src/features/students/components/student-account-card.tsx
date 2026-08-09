import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import {
  activateStudentAccount,
  deactivateStudentAccount,
  provisionStudentAccount,
  resetStudentAccountPassword,
} from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import type { StudentDetail } from '../types/student'
import { staffQueryKeys } from '../../staff/api/staff-query-keys'
import { userQueryKeys } from '../../users/api/user-query-keys'

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let value = 'Yb'
  for (let index = 0; index < 10; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `${value}!`
}

export function StudentAccountCard({ student }: { student: StudentDetail }) {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastPassword, setLastPassword] = useState<string | null>(null)

  const canProvision = Boolean(student.email.trim())

  async function refreshStudent() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.detail(student.id),
      }),
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.lists(),
      }),
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.all,
      }),
    ])
  }

  async function runAccountAction(
    action: () => Promise<{ password?: string }>,
    successTitle: string,
    successDescription: string,
  ) {
    setIsSubmitting(true)
    try {
      const result = await action()
      if (result.password) {
        setLastPassword(result.password)
      }
      await refreshStudent()
      notify('success', {
        title: successTitle,
        description: successDescription,
      })
      setPassword('')
    } catch (error) {
      notify('error', {
        title: 'Account action failed',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
            Portal account
          </h3>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Student login accounts are stored on CustomUser and provisioned from
            this CRM record. Demographics stay on the student profile.
          </p>
        </div>
        <div className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {!student.hasAccount
            ? 'No account'
            : student.accountActive
              ? 'Portal active'
              : 'Portal inactive'}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold tracking-[0.08em] text-slate-400 uppercase">
            Login email
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {student.email || 'Add an email before provisioning'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold tracking-[0.08em] text-slate-400 uppercase">
            Linked user
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {student.hasAccount ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>

      {lastPassword ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Temporary password: <span className="font-semibold">{lastPassword}</span>
          . Share it securely; it will not be shown again after you leave this
          page.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#4274B9] focus:ring-2 focus:ring-[#4274B9]/20"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={() => setPassword(generateTemporaryPassword())}
          >
            <KeyRound className="size-3.5" />
            Generate password
          </Button>

          {!student.hasAccount ? (
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || !canProvision || password.trim().length < 8}
              onClick={() =>
                void runAccountAction(
                  () => provisionStudentAccount(student.id, password.trim()),
                  'Portal account created',
                  `${student.fullName} can now sign in with their email.`,
                )
              }
            >
              <UserRound className="size-3.5" />
              Provision account
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting || password.trim().length < 8}
                onClick={() =>
                  void runAccountAction(
                    () =>
                      resetStudentAccountPassword(student.id, password.trim()),
                    'Password reset',
                    'The student portal password has been updated.',
                  )
                }
              >
                Reset password
              </Button>
              {student.accountActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  disabled={isSubmitting}
                  onClick={() =>
                    void runAccountAction(
                      () => deactivateStudentAccount(student.id),
                      'Portal deactivated',
                      'The student can no longer sign in.',
                    )
                  }
                >
                  Deactivate portal
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting || student.status !== 'active'}
                  onClick={() =>
                    void runAccountAction(
                      () => activateStudentAccount(student.id),
                      'Portal activated',
                      'The student can sign in again.',
                    )
                  }
                >
                  Activate portal
                </Button>
              )}
            </>
          )}
        </div>
        {!canProvision && !student.hasAccount ? (
          <p className="text-sm text-amber-700">
            Add an email address to this student before creating a portal
            account.
          </p>
        ) : null}
      </div>
    </section>
  )
}
