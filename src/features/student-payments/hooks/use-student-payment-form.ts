import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import { useLocksPaymentStatus } from '../../auth/hooks/use-permissions'
import {
  createStudentPayment,
  createEmptyStudentPaymentFormValues,
  studentPaymentToFormValues,
  updateStudentPayment,
  uploadStudentPaymentTermProof,
} from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'
import {
  createTermFormKey,
  emptyTermFormValues,
  takeMatchingServerTermId,
} from '../lib/payment-display'
import { studentPaymentFormSchema } from '../schema/student-payment-form-schema'
import type {
  StudentPaymentFormErrors,
  StudentPaymentFormValues,
  StudentPaymentListItem,
  StudentPaymentTermFieldErrors,
  StudentPaymentTermFormValues,
} from '../types/student-payment'

type UseStudentPaymentFormOptions = {
  mode: 'create' | 'edit'
  paymentId?: string
  initialValues?: StudentPaymentFormValues
  /** After create, return to this student's detail page instead of the payments list. */
  returnToStudentId?: string
  /** After cancel/create without student return, go back to prospective students. */
  returnToProspectiveStudents?: boolean
}

export function useStudentPaymentForm({
  mode,
  paymentId,
  initialValues = createEmptyStudentPaymentFormValues(),
  returnToStudentId,
  returnToProspectiveStudents = false,
}: UseStudentPaymentFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const lockTransactionStatus = useLocksPaymentStatus()
  const [values, setValues] = useState<StudentPaymentFormValues>(initialValues)
  const [errors, setErrors] = useState<StudentPaymentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof StudentPaymentFormValues>(
    field: K,
    value: StudentPaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function updateTerm(
    key: string,
    patch: Partial<StudentPaymentTermFormValues>,
  ) {
    setValues((current) => ({
      ...current,
      terms: current.terms.map((term) =>
        term.key === key ? { ...term, ...patch } : term,
      ),
    }))
    setErrors((current) => {
      if (!current.termErrors?.[key]) {
        return { ...current, terms: undefined }
      }
      const nextTermErrors = { ...current.termErrors }
      const nextFieldErrors = { ...nextTermErrors[key] }
      for (const field of Object.keys(patch) as (keyof StudentPaymentTermFormValues)[]) {
        if (field !== 'key' && field !== 'id') {
          delete nextFieldErrors[field as keyof StudentPaymentTermFieldErrors]
        }
      }
      nextTermErrors[key] = nextFieldErrors
      return { ...current, terms: undefined, termErrors: nextTermErrors }
    })
  }

  function addTerm(initial?: Partial<StudentPaymentTermFormValues>) {
    setValues((current) => ({
      ...current,
      terms: [
        ...current.terms,
        {
          ...emptyTermFormValues(),
          ...initial,
          key: createTermFormKey(),
        },
      ],
    }))
    setErrors((current) => ({ ...current, terms: undefined }))
  }

  function removeTerm(key: string) {
    setValues((current) => ({
      ...current,
      terms: current.terms.filter((term) => term.key !== key),
    }))
    setErrors((current) => {
      if (!current.termErrors) return { ...current, terms: undefined }
      const nextTermErrors = { ...current.termErrors }
      delete nextTermErrors[key]
      return { ...current, terms: undefined, termErrors: nextTermErrors }
    })
  }

  function validateForm(nextValues: StudentPaymentFormValues) {
    const result = studentPaymentFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: StudentPaymentFormErrors = { termErrors: {} }

    for (const issue of result.error.issues) {
      const [root, index, nested] = issue.path

      if (root === 'terms') {
        if (typeof index !== 'number') {
          nextErrors.terms = issue.message
          continue
        }
        const termKey = nextValues.terms[index]?.key
        if (!termKey || typeof nested !== 'string') {
          nextErrors.terms = issue.message
          continue
        }
        nextErrors.termErrors ??= {}
        nextErrors.termErrors[termKey] = {
          ...nextErrors.termErrors[termKey],
          [nested]: issue.message,
        }
        continue
      }

      if (
        typeof root === 'string' &&
        (root === 'studentId' ||
          root === 'prospectiveStudentId' ||
          root === 'title' ||
          root === 'fullAmount' ||
          root === 'terms')
      ) {
        nextErrors[root] = issue.message
      }
    }

    setErrors(nextErrors)
    return false
  }

  function navigateAfterSave() {
    if (returnToStudentId) {
      void navigate({
        to: '/students/$studentId',
        params: { studentId: returnToStudentId },
      })
      return
    }
    if (returnToProspectiveStudents) {
      void navigate({ to: '/prospective-students' })
      return
    }
    void navigate({ to: '/student-payments' })
  }

  async function uploadStagedProofs(
    payment: StudentPaymentListItem,
    formTerms: StudentPaymentTermFormValues[],
  ) {
    const knownIds = new Set(
      formTerms
        .map((term) => term.id)
        .filter((id): id is string => Boolean(id)),
    )
    const unmatched = payment.terms.filter((term) => !knownIds.has(term.id))

    for (const formTerm of formTerms) {
      const files = formTerm.proofFiles ?? []
      if (files.length === 0 || formTerm.status !== 'pending') continue
      const termId =
        formTerm.id ?? takeMatchingServerTermId(formTerm, unmatched)
      if (!termId) continue
      for (const file of files) {
        await uploadStudentPaymentTermProof(payment.id, termId, file)
      }
    }
  }

  async function persistTerm(
    key: string,
    patch: Partial<StudentPaymentTermFormValues>,
  ): Promise<StudentPaymentListItem | null> {
    const existing = values.terms.find((term) => term.key === key)
    if (!existing) return null

    const patchedTerm = { ...existing, ...patch }
    updateTerm(key, patch)

    if (!paymentId || !patchedTerm.id) {
      return null
    }

    const updated = await updateStudentPayment(
      paymentId,
      { ...values, terms: [patchedTerm] },
      { omitStatus: lockTransactionStatus },
    )

    setValues((current) => ({
      ...current,
      terms: current.terms.map((term) => {
        if (term.key !== key) return term
        const server = updated.terms.find((item) => item.id === term.id)
        if (!server) {
          return { ...term, ...patch, proofFiles: patch.proofFiles }
        }
        return {
          ...term,
          id: server.id,
          amount: String(server.amount || ''),
          // Prefer the applied patch for status so the UI updates even if the
          // response briefly lags; fall back to the server value otherwise.
          status: patch.status ?? server.status,
          description:
            patch.description !== undefined
              ? patch.description
              : server.description,
          paymentDate: patch.paymentDate ?? server.paymentDate,
          branchId:
            patch.branchId !== undefined
              ? patch.branchId
              : (server.branchId ?? ''),
          proofFiles: patch.proofFiles,
        }
      }),
    }))

    return updated
  }

  async function persistNewTerm(
    initial?: Partial<StudentPaymentTermFormValues>,
  ): Promise<{
    payment: StudentPaymentListItem
    termKey: string
    termId: string
  } | null> {
    const newTerm: StudentPaymentTermFormValues = {
      ...emptyTermFormValues(
        initial?.status ?? 'pending',
        initial?.branchId ?? '',
      ),
      ...initial,
      key: createTermFormKey(),
    }
    const proofFiles = newTerm.proofFiles ?? []
    const termForSave = { ...newTerm, proofFiles: undefined }
    const nextTerms = [...values.terms, termForSave]

    setValues((current) => ({
      ...current,
      terms: [...current.terms, newTerm],
    }))
    setErrors((current) => ({ ...current, terms: undefined }))

    if (!paymentId) {
      return null
    }

    const updated = await updateStudentPayment(
      paymentId,
      { ...values, terms: nextTerms },
      { omitStatus: lockTransactionStatus },
    )

    const knownIds = new Set(
      values.terms
        .map((term) => term.id)
        .filter((id): id is string => Boolean(id)),
    )
    const unmatched = updated.terms.filter((term) => !knownIds.has(term.id))
    const matchedId = takeMatchingServerTermId(termForSave, unmatched)

    setValues((current) => ({
      ...current,
      terms: current.terms.map((term) => {
        if (term.id) {
          const server = updated.terms.find((item) => item.id === term.id)
          if (!server) return term
          return {
            ...term,
            id: server.id,
            amount: String(server.amount || ''),
            status: server.status,
            description: server.description,
            paymentDate: server.paymentDate,
            branchId: server.branchId ?? '',
            proofFiles:
              term.key === newTerm.key ? proofFiles : term.proofFiles,
          }
        }
        if (term.key !== newTerm.key) return term
        return {
          ...term,
          id: matchedId,
          proofFiles,
        }
      }),
    }))

    if (!matchedId) {
      return { payment: updated, termKey: newTerm.key, termId: '' }
    }

    return {
      payment: updated,
      termKey: newTerm.key,
      termId: matchedId,
    }
  }

  async function submit() {
    const isValid = validateForm(values)

    if (!isValid) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to record payment'
            : 'Unable to update payment',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createStudentPayment(values, {
          omitStatus: lockTransactionStatus,
        })
        await uploadStagedProofs(created, values.terms)
        await queryClient.invalidateQueries({
          queryKey: studentPaymentQueryKeys.all,
        })
        invalidateNavBadges()
        notify('success', {
          title: 'Payment recorded',
          description: `${created.title} for ${created.studentName} has been added.`,
        })
        navigateAfterSave()
        return
      }

      if (!paymentId) {
        return
      }

      const updated = await updateStudentPayment(paymentId, values, {
        omitStatus: lockTransactionStatus,
      })
      await uploadStagedProofs(updated, values.terms)
      await queryClient.invalidateQueries({
        queryKey: studentPaymentQueryKeys.all,
      })
      invalidateNavBadges()
      const mapped = studentPaymentToFormValues(updated)
      const byId = new Map(
        mapped.terms
          .filter((term) => term.id)
          .map((term) => [term.id as string, term]),
      )
      const usedIds = new Set<string>()
      const orderedTerms = values.terms.flatMap((term) => {
        if (!term.id) return []
        const server = byId.get(term.id)
        if (!server) return []
        usedIds.add(term.id)
        return [{ ...server, key: term.key }]
      })
      for (const term of mapped.terms) {
        if (term.id && !usedIds.has(term.id)) {
          orderedTerms.push(term)
        }
      }
      setValues({
        ...mapped,
        terms: orderedTerms,
      })
      notify('success', {
        title: 'Payment updated',
        description: `${updated.title} has been saved.`,
      })
      return updated
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to record payment'
            : 'Unable to update payment',
        description: getApiErrorMessage(error),
      })
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    navigateAfterSave()
  }

  return {
    values,
    errors,
    isSubmitting,
    updateField,
    updateTerm,
    persistTerm,
    persistNewTerm,
    addTerm,
    removeTerm,
    submit,
    cancel,
  }
}
