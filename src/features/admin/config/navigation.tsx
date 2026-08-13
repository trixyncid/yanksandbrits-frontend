import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  PieChart,
  Receipt,
  School,
  ShieldCheck,
  Users,
  UserSquare2,
} from 'lucide-react'

export type AppPath =
  | '/dashboard'
  | '/students'
  | '/students/new'
  | '/student-groups'
  | '/student-groups/new'
  | '/student-payments'
  | '/student-payments/new'
  | '/prospective-students'
  | '/prospective-students/new'
  | '/prediction-tests'
  | '/prediction-tests/new'
  | '/programs'
  | '/programs/new'
  | '/classrooms'
  | '/classrooms/new'
  | '/full-schedule'
  | '/users'
  | '/tutors'
  | '/marketings'
  | '/staff-permissions'
  | '/paid-leaves'
  | '/branches'
  | '/institutions'
  | '/occupations'
  | '/student-report'
  | '/bookkeeping'
  | '/bookkeeping/new'
  | '/tutor-report'
  | '/marketing-report'
  | '/appointment-by-tutor'
  | '/profile'
  | '/notifications'

export type NavigationLeafItem = {
  id: string
  label: string
  icon: LucideIcon
  to?: AppPath
}

export type NavigationGroupItem = {
  id: string
  label: string
  icon: LucideIcon
  children: NavigationLeafItem[]
}

export type NavigationItem = NavigationLeafItem | NavigationGroupItem

export function isNavigationGroup(
  item: NavigationItem,
): item is NavigationGroupItem {
  return 'children' in item
}

export const adminNavigation: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    children: [
      {
        id: 'student-list',
        label: 'Student List',
        icon: ClipboardList,
        to: '/students',
      },
      {
        id: 'student-group',
        label: 'Student Group',
        icon: UserSquare2,
        to: '/student-groups',
      },
      {
        id: 'student-payment',
        label: 'Student Payment',
        icon: CreditCard,
        to: '/student-payments',
      },
      {
        id: 'student-report',
        label: 'Student Report',
        icon: PieChart,
        to: '/student-report',
      },
      {
        id: 'institution',
        label: 'Institutions',
        icon: School,
        to: '/institutions',
      },
      {
        id: 'occupation',
        label: 'Occupations',
        icon: ClipboardList,
        to: '/occupations',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    children: [
      {
        id: 'prospective-student',
        label: 'Prospective Student',
        icon: Users,
        to: '/prospective-students',
      },
      {
        id: 'prediction-test',
        label: 'Prediction Test',
        icon: ShieldCheck,
        to: '/prediction-tests',
      },
    ],
  },
  {
    id: 'academics',
    label: 'Academics',
    icon: School,
    children: [
      {
        id: 'program',
        label: 'Program',
        icon: BookOpen,
        to: '/programs',
      },
      {
        id: 'classroom',
        label: 'Classroom',
        icon: School,
        to: '/classrooms',
      },
      {
        id: 'full-schedule',
        label: 'Full Schedule',
        icon: CalendarDays,
        to: '/full-schedule',
      },
      {
        id: 'appointment-by-tutor',
        label: 'Tutor Sessions',
        icon: CalendarDays,
        to: '/appointment-by-tutor',
      },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: FolderKanban,
    children: [
      {
        id: 'staff-list',
        label: 'Users',
        icon: Users,
        to: '/users',
      },
      {
        id: 'tutor-list',
        label: 'Tutor List',
        icon: GraduationCap,
        to: '/tutors',
      },
      {
        id: 'marketing-list',
        label: 'Marketing List',
        icon: Megaphone,
        to: '/marketings',
      },
      {
        id: 'staff-permission',
        label: 'Roles',
        icon: ShieldCheck,
        to: '/staff-permissions',
      },
      {
        id: 'paid-leave',
        label: 'Paid Leave',
        icon: ClipboardList,
        to: '/paid-leaves',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    children: [
      {
        id: 'bookkeeping',
        label: 'Bookkeeping',
        icon: Receipt,
        to: '/bookkeeping',
      },
      {
        id: 'tutor-report',
        label: 'Tutor Report',
        icon: PieChart,
        to: '/tutor-report',
      },
      {
        id: 'marketing-report',
        label: 'Marketing Report',
        icon: PieChart,
        to: '/marketing-report',
      },
    ],
  },
  {
    id: 'branch',
    label: 'Branch',
    icon: School,
    to: '/branches',
  },
]
