import { create } from 'zustand'

import { parseCurrencyValue } from '../../../shared/lib/currency'
import { resolveStudentFromPin, studentPaymentListPlaceholder } from '../data/student-payments-placeholder'
import type {
  StudentPaymentFormValues,
  StudentPaymentListItem,
} from '../types/student-payment'

type StudentPaymentsState = {
  items: StudentPaymentListItem[]
  getById: (id: string) => StudentPaymentListItem | undefined
  add: (values: StudentPaymentFormValues) => StudentPaymentListItem
  update: (
    id: string,
    values: StudentPaymentFormValues,
  ) => StudentPaymentListItem | undefined
  remove: (id: string) => void
}

function toIsoDate(value: string) {
  if (!value) {
    return new Date().toISOString()
  }

  const normalized = value.length === 10 ? `${value}T09:00:00` : value
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }

  return parsed.toISOString()
}

function formValuesToPayment(
  values: StudentPaymentFormValues,
  existing?: StudentPaymentListItem,
): StudentPaymentListItem {
  const student = resolveStudentFromPin(values.studentPin)

  return {
    id: existing?.id ?? `p-${Date.now()}`,
    studentPin: values.studentPin,
    studentName: student?.fullName ?? existing?.studentName ?? 'Unknown',
    title: values.title.trim(),
    description: values.description.trim(),
    amount: parseCurrencyValue(values.amount),
    transactionDate: toIsoDate(values.transactionDate),
    status: values.status,
    createdBy: existing?.createdBy ?? 'Admin YNB',
    hasPaymentProof: values.hasPaymentProof,
    branch: student?.branch ?? existing?.branch ?? 'Main Branch',
  }
}

export const useStudentPaymentsStore = create<StudentPaymentsState>(
  (set, get) => ({
    items: studentPaymentListPlaceholder,
    getById: (id) => get().items.find((item) => item.id === id),
    add: (values) => {
      const next = formValuesToPayment(values)
      set((state) => ({ items: [next, ...state.items] }))
      return next
    },
    update: (id, values) => {
      const existing = get().getById(id)
      if (!existing) {
        return undefined
      }
      const next = formValuesToPayment(values, existing)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? next : item)),
      }))
      return next
    },
    remove: (id) =>
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
  }),
)
