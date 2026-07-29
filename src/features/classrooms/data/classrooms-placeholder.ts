import { branchListPlaceholder } from '../../branches/data/branches-placeholder'
import type {
  ClassroomFormValues,
  ClassroomListItem,
} from '../types/classroom'

export const classroomBranchOptions = branchListPlaceholder.map((branch) => ({
  id: branch.id,
  name: branch.name,
}))

export const classroomListPlaceholder: ClassroomListItem[] = [
  {
    id: 'cls1',
    code: 'RM-101',
    className: 'Blue Room',
    isActive: true,
    createdAt: '2026-01-12T09:00:00',
    updatedAt: '2026-01-12T09:00:00',
    createdBy: 'Admin YNB',
    branch: 'Main Branch',
  },
  {
    id: 'cls2',
    code: 'RM-102',
    className: 'Green Room',
    isActive: true,
    createdAt: '2026-01-12T09:05:00',
    updatedAt: '2026-01-12T09:05:00',
    createdBy: 'Admin YNB',
    branch: 'Main Branch',
  },
  {
    id: 'cls3',
    code: 'RM-201',
    className: 'Discussion Hall',
    isActive: true,
    createdAt: '2026-02-03T10:20:00',
    updatedAt: '2026-02-03T10:20:00',
    createdBy: 'Admin YNB',
    branch: 'West Branch',
  },
  {
    id: 'cls4',
    code: 'RM-202',
    className: 'Listening Lab',
    isActive: false,
    createdAt: '2026-02-03T10:25:00',
    updatedAt: '2026-02-03T10:25:00',
    createdBy: 'Admin YNB',
    branch: 'West Branch',
  },
  {
    id: 'cls5',
    code: 'RM-301',
    className: 'SAT Studio',
    isActive: true,
    createdAt: '2026-03-08T14:10:00',
    updatedAt: '2026-03-08T14:10:00',
    createdBy: 'Admin YNB',
    branch: 'South Branch',
  },
  {
    id: 'cls6',
    code: 'RM-302',
    className: 'Speaking Corner',
    isActive: true,
    createdAt: '2026-03-08T14:15:00',
    updatedAt: '2026-03-08T14:15:00',
    createdBy: 'Admin YNB',
    branch: 'South Branch',
  },
  {
    id: 'cls7',
    code: 'RM-A1',
    className: 'Kids Play Class',
    isActive: true,
    createdAt: '2026-03-20T08:40:00',
    updatedAt: '2026-03-20T08:40:00',
    createdBy: 'Admin YNB',
    branch: 'Main Branch',
  },
  {
    id: 'cls8',
    code: 'RM-B2',
    className: 'Private Tutoring Suite',
    isActive: false,
    createdAt: '2026-04-01T11:30:00',
    updatedAt: '2026-04-01T11:30:00',
    createdBy: 'Admin YNB',
    branch: 'West Branch',
  },
]

export const emptyClassroomFormValues: ClassroomFormValues = {
  code: '',
  className: '',
  isActive: true,
  branch: 'Main Branch',
}

export function classroomToFormValues(
  classroom: ClassroomListItem,
): ClassroomFormValues {
  return {
    code: classroom.code,
    className: classroom.className,
    isActive: classroom.isActive,
    branch: classroom.branch,
  }
}
