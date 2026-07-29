import { create } from 'zustand'

import {
  resolveStudentOption,
  resolveTutorOption,
  studentResponseListPlaceholder,
} from '../data/student-responses-placeholder'
import type {
  StudentResponseFormValues,
  StudentResponseListItem,
} from '../types/student-response'

type StudentResponsesState = {
  items: StudentResponseListItem[]
  getById: (id: string) => StudentResponseListItem | undefined
  add: (values: StudentResponseFormValues) => StudentResponseListItem
  update: (
    id: string,
    values: StudentResponseFormValues,
  ) => StudentResponseListItem | undefined
  remove: (id: string) => void
}

function formValuesToResponse(
  values: StudentResponseFormValues,
  existing?: StudentResponseListItem,
): StudentResponseListItem {
  const student = resolveStudentOption(values.studentPin)
  const tutor = resolveTutorOption(values.tutorPin)
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? `sr-${Date.now()}`,
    studentPin: values.studentPin,
    studentName: student?.fullName ?? existing?.studentName ?? 'Unknown',
    studentEmail: student?.email ?? existing?.studentEmail ?? '',
    studentPhone: student?.phone ?? existing?.studentPhone ?? '',
    title: values.title.trim(),
    tutorPin: values.tutorPin,
    tutorName: tutor?.fullName ?? existing?.tutorName ?? 'Unknown',
    tutorEmail: tutor?.email ?? existing?.tutorEmail ?? '',
    tutorPhone: tutor?.phone ?? existing?.tutorPhone ?? '',
    description: values.description.trim(),
    createdAt: existing?.createdAt ?? now,
    status: values.status,
  }
}

export const useStudentResponsesStore = create<StudentResponsesState>(
  (set, get) => ({
    items: studentResponseListPlaceholder,
    getById: (id) => get().items.find((item) => item.id === id),
    add: (values) => {
      const next = formValuesToResponse(values)
      set((state) => ({ items: [next, ...state.items] }))
      return next
    },
    update: (id, values) => {
      const existing = get().getById(id)
      if (!existing) {
        return undefined
      }
      const next = formValuesToResponse(values, existing)
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
