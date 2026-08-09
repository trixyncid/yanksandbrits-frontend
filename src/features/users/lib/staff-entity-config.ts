export type StaffEntityKind = 'staff' | 'tutor' | 'marketing'

export type StaffEntityConfig = {
  kind: StaffEntityKind
  singular: string
  plural: string
  listPath: '/users' | '/tutors' | '/marketings'
  listQueryKey: readonly unknown[]
}

export const staffEntityConfig: StaffEntityConfig = {
  kind: 'staff',
  singular: 'User',
  plural: 'Users',
  listPath: '/users',
  listQueryKey: ['staff'],
}

export const tutorEntityConfig: StaffEntityConfig = {
  kind: 'tutor',
  singular: 'Tutor',
  plural: 'Tutors',
  listPath: '/tutors',
  listQueryKey: ['tutors'],
}

export const marketingEntityConfig: StaffEntityConfig = {
  kind: 'marketing',
  singular: 'Marketing',
  plural: 'Marketings',
  listPath: '/marketings',
  listQueryKey: ['marketings'],
}
