import { create } from 'zustand'

import { parseCurrencyValue } from '../../../shared/lib/currency'
import { useNewStudentsStore } from '../../new-students/store/new-students-store'
import { predictionTestListPlaceholder } from '../data/prediction-tests-placeholder'
import type {
  PredictionTestFormValues,
  PredictionTestListItem,
} from '../types/prediction-test'

type PredictionTestsState = {
  items: PredictionTestListItem[]
  getById: (id: string) => PredictionTestListItem | undefined
  getByStudentId: (studentId: string) => PredictionTestListItem | undefined
  add: (values: PredictionTestFormValues) => PredictionTestListItem
  update: (
    id: string,
    values: PredictionTestFormValues,
  ) => PredictionTestListItem | undefined
  ensureForStudent: (studentId: string) => PredictionTestListItem
  remove: (id: string) => void
}

function resolveStudent(studentId: string) {
  return useNewStudentsStore.getState().getById(studentId)
}

function parseScore(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

function formValuesToTest(
  values: PredictionTestFormValues,
  existing?: PredictionTestListItem,
): PredictionTestListItem {
  const student = resolveStudent(values.studentId)
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? `pt-${Date.now()}`,
    studentId: values.studentId,
    studentName: student?.fullName ?? existing?.studentName ?? 'Unknown',
    studentEmail: student?.email ?? existing?.studentEmail ?? '',
    studentPhone: student?.phone ?? existing?.studentPhone ?? '',
    score: parseScore(values.score),
    description: values.description.trim(),
    amount: parseCurrencyValue(values.amount),
    status: values.status,
    educationCounsellor:
      student?.educationCounsellor ?? existing?.educationCounsellor ?? '',
    hasPaymentProof: values.hasPaymentProof,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    branch: student?.branch ?? existing?.branch ?? 'Main Branch',
  }
}

export const usePredictionTestsStore = create<PredictionTestsState>(
  (set, get) => ({
    items: predictionTestListPlaceholder,
    getById: (id) => get().items.find((item) => item.id === id),
    getByStudentId: (studentId) =>
      get().items.find((item) => item.studentId === studentId),
    add: (values) => {
      const next = formValuesToTest(values)
      set((state) => ({ items: [next, ...state.items] }))
      return next
    },
    update: (id, values) => {
      const existing = get().getById(id)
      if (!existing) {
        return undefined
      }
      const next = formValuesToTest(values, existing)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? next : item)),
      }))
      return next
    },
    ensureForStudent: (studentId) => {
      const existing = get().getByStudentId(studentId)
      if (existing) {
        return existing
      }

      const student = resolveStudent(studentId)
      const now = new Date().toISOString()
      const next: PredictionTestListItem = {
        id: `pt-${Date.now()}`,
        studentId,
        studentName: student?.fullName ?? 'Unknown',
        studentEmail: student?.email ?? '',
        studentPhone: student?.phone ?? '',
        score: null,
        description: '',
        amount: 0,
        status: 'pending',
        educationCounsellor: student?.educationCounsellor ?? '',
        hasPaymentProof: false,
        createdAt: now,
        updatedAt: now,
        branch: student?.branch ?? 'Main Branch',
      }

      set((state) => ({ items: [next, ...state.items] }))
      return next
    },
    remove: (id) =>
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
  }),
)
