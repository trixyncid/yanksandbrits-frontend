import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
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
  | '/student-responses'
  | '/student-groups'
  | '/student-payments'
  | '/new-students'
  | '/prediction-tests'
  | '/programs'
  | '/classrooms'
  | '/full-schedule'
  | '/staff'
  | '/tutors'
  | '/marketings'

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
    id: 'student-data',
    label: 'Student Data',
    icon: Users,
    children: [
      {
        id: 'student-list',
        label: 'Student List',
        icon: ClipboardList,
        to: '/students',
      },
      { id: 'student-report', label: 'Student Report', icon: PieChart },
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
        id: 'student-response',
        label: 'Student Response',
        icon: MessageSquareText,
        to: '/student-responses',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    children: [
      {
        id: 'new-student',
        label: 'New Student',
        icon: Users,
        to: '/new-students',
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
    id: 'academic-data',
    label: 'Academic Data',
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
    ],
  },
  {
    id: 'full-schedule',
    label: 'Full Schedule',
    icon: CalendarDays,
    to: '/full-schedule',
  },
  {
    id: 'staff-data',
    label: 'Staff Data',
    icon: FolderKanban,
    children: [
      {
        id: 'staff-list',
        label: 'Staff List',
        icon: Users,
        to: '/staff',
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
      { id: 'staff-permission', label: 'Staff Permission', icon: ShieldCheck },
    ],
  },
  {
    id: 'report',
    label: 'Report',
    icon: Receipt,
    children: [
      { id: 'bookkeeping', label: 'Bookkeeping', icon: Receipt },
      { id: 'tutor-report', label: 'Tutor Report', icon: PieChart },
      { id: 'marketing-report', label: 'Marketing Report', icon: PieChart },
    ],
  },
  {
    id: 'appointment-by-tutor',
    label: 'Appointment By Tutor',
    icon: CalendarDays,
  },
  {
    id: 'paid-leave',
    label: 'Paid Leave',
    icon: ClipboardList,
  },
  {
    id: 'branch',
    label: 'Branch',
    icon: School,
  },
]
