import { create } from 'zustand'

import { classroomListPlaceholder } from '../data/classrooms-placeholder'
import type {
  ClassroomFormValues,
  ClassroomListItem,
} from '../types/classroom'

type ClassroomsState = {
  items: ClassroomListItem[]
  getById: (id: string) => ClassroomListItem | undefined
  add: (values: ClassroomFormValues) => ClassroomListItem
  update: (
    id: string,
    values: ClassroomFormValues,
  ) => ClassroomListItem | undefined
  remove: (id: string) => void
}

function formValuesToClassroom(
  values: ClassroomFormValues,
  existing?: ClassroomListItem,
): ClassroomListItem {
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? `cls-${Date.now()}`,
    code: values.code.trim().toUpperCase(),
    className: values.className.trim(),
    isActive: values.isActive,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? 'Admin YNB',
    branch: values.branch,
  }
}

export const useClassroomsStore = create<ClassroomsState>((set, get) => ({
  items: classroomListPlaceholder,
  getById: (id) => get().items.find((item) => item.id === id),
  add: (values) => {
    const next = formValuesToClassroom(values)
    set((state) => ({ items: [next, ...state.items] }))
    return next
  },
  update: (id, values) => {
    const existing = get().getById(id)
    if (!existing) {
      return undefined
    }
    const next = formValuesToClassroom(values, existing)
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
