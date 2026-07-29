import { create } from 'zustand'

import { programListPlaceholder } from '../data/programs-placeholder'
import type { ProgramFormValues, ProgramListItem } from '../types/program'

type ProgramsState = {
  items: ProgramListItem[]
  getById: (id: string) => ProgramListItem | undefined
  add: (values: ProgramFormValues) => ProgramListItem
  update: (
    id: string,
    values: ProgramFormValues,
  ) => ProgramListItem | undefined
  remove: (id: string) => void
}

function formValuesToProgram(
  values: ProgramFormValues,
  existing?: ProgramListItem,
): ProgramListItem {
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? `prg-${Date.now()}`,
    code: values.code.trim().toUpperCase(),
    title: values.title.trim(),
    description: values.description.trim(),
    isActive: values.isActive,
    backgroundColor: values.backgroundColor.trim().toUpperCase(),
    textColor: values.textColor.trim().toUpperCase(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? 'Admin YNB',
  }
}

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  items: programListPlaceholder,
  getById: (id) => get().items.find((item) => item.id === id),
  add: (values) => {
    const next = formValuesToProgram(values)
    set((state) => ({ items: [next, ...state.items] }))
    return next
  },
  update: (id, values) => {
    const existing = get().getById(id)
    if (!existing) {
      return undefined
    }
    const next = formValuesToProgram(values, existing)
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
