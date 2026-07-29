import { create } from 'zustand'

import {
  emptyStudentFormValues,
  studentDetailsPlaceholder,
  toStudentListItem,
} from '../data/students-placeholder'
import type {
  StudentDetail,
  StudentFormValues,
  StudentListItem,
} from '../types/student'

type StudentsState = {
  items: StudentDetail[]
  list: () => StudentListItem[]
  getById: (id: string) => StudentDetail | undefined
  add: (values: StudentFormValues) => StudentDetail
  update: (id: string, values: StudentFormValues) => StudentDetail | undefined
  remove: (id: string) => void
}

function formValuesToDetail(
  values: StudentFormValues,
  existing?: StudentDetail,
): StudentDetail {
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? `stu-${Date.now()}`,
    pin: values.pin.trim(),
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    gender: values.gender,
    birthPlace: values.birthPlace.trim() || '-',
    birthDate: values.birthDate,
    address: values.address.trim() || '-',
    mobilePhone: values.mobilePhone.trim(),
    homePhone: values.homePhone.trim() || '-',
    othersPhone: values.othersPhone.trim() || '-',
    occupation: values.occupation.trim() || '-',
    institution: values.institution.trim() || '-',
    enrollmentDate: values.enrollmentDate,
    status: values.status,
    paymentStatus: existing?.paymentStatus ?? 'pending',
    counsellor: values.counsellor,
    referral: values.referral.trim() || '-',
    grn: values.grn.trim() || '-',
    branch: values.branch,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? values.counsellor,
    updatedBy: values.counsellor,
    programs: existing?.programs ?? [],
  }
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  items: studentDetailsPlaceholder,
  list: () => get().items.map(toStudentListItem),
  getById: (id) => get().items.find((item) => item.id === id),
  add: (values) => {
    const next = formValuesToDetail(values)
    set((state) => ({ items: [next, ...state.items] }))
    return next
  },
  update: (id, values) => {
    const existing = get().getById(id)
    if (!existing) {
      return undefined
    }
    const next = formValuesToDetail(values, existing)
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

export { emptyStudentFormValues }
