import { create } from 'zustand'

import {
  resolveBranchFromPins,
  resolveMembersFromPins,
  studentGroupListPlaceholder,
} from '../data/student-groups-placeholder'
import type {
  StudentGroupFormValues,
  StudentGroupListItem,
} from '../types/student-group'

type StudentGroupsState = {
  items: StudentGroupListItem[]
  getById: (id: string) => StudentGroupListItem | undefined
  add: (values: StudentGroupFormValues) => StudentGroupListItem
  update: (
    id: string,
    values: StudentGroupFormValues,
  ) => StudentGroupListItem | undefined
  remove: (id: string) => void
}

function formValuesToGroup(
  values: StudentGroupFormValues,
  existing?: StudentGroupListItem,
): StudentGroupListItem {
  const now = new Date().toISOString()
  const members = resolveMembersFromPins(values.memberPins)

  return {
    id: existing?.id ?? `g-${Date.now()}`,
    groupName: values.groupName.trim(),
    members,
    status: values.status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? 'Admin YNB',
    branch: resolveBranchFromPins(values.memberPins),
  }
}

export const useStudentGroupsStore = create<StudentGroupsState>((set, get) => ({
  items: studentGroupListPlaceholder,
  getById: (id) => get().items.find((item) => item.id === id),
  add: (values) => {
    const next = formValuesToGroup(values)
    set((state) => ({ items: [next, ...state.items] }))
    return next
  },
  update: (id, values) => {
    const existing = get().getById(id)
    if (!existing) {
      return undefined
    }
    const next = formValuesToGroup(values, existing)
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
