export type StaffEntityKind = 'staff' | 'tutor' | 'marketing'

export type StaffEntityConfig = {
  kind: StaffEntityKind
  singular: string
  plural: string
  listPath: '/users' | '/tutors' | '/marketings'
  listQueryKey: readonly unknown[]
  /** When creating, preselect this system/custom role by code. */
  defaultRoleCode?: string
  createTitle?: string
  createDescription?: string
}

export const staffEntityConfig: StaffEntityConfig = {
  kind: 'staff',
  singular: 'User',
  plural: 'Users',
  listPath: '/users',
  listQueryKey: ['staff'],
  createTitle: 'Add Staff Account',
  createDescription:
    'Create a staff login account with profile, contact, and role details.',
}

export const tutorEntityConfig: StaffEntityConfig = {
  kind: 'tutor',
  singular: 'Tutor',
  plural: 'Tutors',
  listPath: '/tutors',
  listQueryKey: ['tutors'],
  defaultRoleCode: 'tutor',
  createTitle: 'Add Tutor',
  createDescription:
    'Set up who they are, where they teach, and the contract bonus tiers will use.',
}

export const marketingEntityConfig: StaffEntityConfig = {
  kind: 'marketing',
  singular: 'Education Counsellor',
  plural: 'Education Counsellors',
  listPath: '/marketings',
  listQueryKey: ['marketings'],
  defaultRoleCode: 'education-counsellor',
  createTitle: 'Add Education Counsellor',
  createDescription:
    'Add the person who owns leads. Their initials are the stamp on commission reports.',
}
