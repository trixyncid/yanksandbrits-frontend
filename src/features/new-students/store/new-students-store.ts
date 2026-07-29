import { create } from 'zustand'

import { newStudentListPlaceholder } from '../data/new-students-placeholder'
import type {
  NewStudentFormValues,
  NewStudentListItem,
} from '../types/new-student'

type NewStudentsState = {
  items: NewStudentListItem[]
  getById: (id: string) => NewStudentListItem | undefined
  add: (values: NewStudentFormValues) => NewStudentListItem
  update: (
    id: string,
    values: NewStudentFormValues,
  ) => NewStudentListItem | undefined
  remove: (id: string) => void
}

function formValuesToStudent(
  values: NewStudentFormValues,
  existing?: NewStudentListItem,
): NewStudentListItem {
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? `ns-${Date.now()}`,
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    gender: values.gender === 'female' ? 'female' : 'male',
    course: values.course,
    status: values.status,
    educationCounsellor: values.educationCounsellor,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    branch: values.branch,
  }
}

export const useNewStudentsStore = create<NewStudentsState>((set, get) => ({
  items: newStudentListPlaceholder,
  getById: (id) => get().items.find((item) => item.id === id),
  add: (values) => {
    const next = formValuesToStudent(values)
    set((state) => ({ items: [next, ...state.items] }))
    return next
  },
  update: (id, values) => {
    const existing = get().getById(id)
    if (!existing) {
      return undefined
    }
    const next = formValuesToStudent(values, existing)
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? next : item)),
    }))
    return next
  },
  remove: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}))
