import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router'

import { useAuthStore } from '../features/auth/store/auth-store'
import { RootLayout } from './root-layout'
import { AppLoadingScreen } from './ui/app-loading-screen'

function AuthenticatedLayout() {
  return <Outlet />
}

const rootRoute = createRootRoute({
  component: RootLayout,
  pendingComponent: AppLoadingScreen,
  beforeLoad: async () => {
    await useAuthStore.getState().hydrate()
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    await useAuthStore.getState().hydrate()
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/login' })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    await useAuthStore.getState().hydrate()
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: lazyRouteComponent(() => import('../features/auth/pages/login-page')),
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    await useAuthStore.getState().hydrate()
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: lazyRouteComponent(
    () => import('../features/admin/pages/dashboard-page'),
  ),
})

const studentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/students',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-list-page'),
  ),
})

const studentCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/students/new',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-create-page'),
  ),
})

const studentDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/students/$studentId',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-detail-page'),
  ),
})

const studentEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/students/$studentId/edit',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-edit-page'),
  ),
})

const studentResponsesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-responses',
  component: lazyRouteComponent(
    () =>
      import('../features/student-responses/pages/student-response-list-page'),
  ),
})

const studentResponseCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-responses/new',
  component: lazyRouteComponent(
    () =>
      import(
        '../features/student-responses/pages/student-response-create-page'
      ),
  ),
})

const studentResponseEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-responses/$responseId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/student-responses/pages/student-response-edit-page'),
  ),
})

const studentGroupsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-groups',
  component: lazyRouteComponent(
    () =>
      import('../features/student-groups/pages/student-group-list-page'),
  ),
})

const studentGroupCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-groups/new',
  component: lazyRouteComponent(
    () =>
      import('../features/student-groups/pages/student-group-create-page'),
  ),
})

const studentGroupEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-groups/$groupId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/student-groups/pages/student-group-edit-page'),
  ),
})

const studentPaymentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-payments',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-list-page'),
  ),
})

const studentPaymentCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-payments/new',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-create-page'),
  ),
})

const studentPaymentEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-payments/$paymentId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-edit-page'),
  ),
})

const newStudentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/new-students',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-list-page'),
  ),
})

const newStudentCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/new-students/new',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-create-page'),
  ),
})

const newStudentEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/new-students/$studentId/edit',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-edit-page'),
  ),
})

const predictionTestsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/prediction-tests',
  component: lazyRouteComponent(
    () =>
      import('../features/prediction-tests/pages/prediction-test-list-page'),
  ),
})

const predictionTestCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/prediction-tests/new',
  component: lazyRouteComponent(
    () =>
      import('../features/prediction-tests/pages/prediction-test-create-page'),
  ),
})

const predictionTestEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/prediction-tests/$testId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/prediction-tests/pages/prediction-test-edit-page'),
  ),
})

const programsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/programs',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-list-page'),
  ),
})

const programCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/programs/new',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-create-page'),
  ),
})

const programEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/programs/$programId/edit',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-edit-page'),
  ),
})

const classroomsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/classrooms',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-list-page'),
  ),
})

const classroomCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/classrooms/new',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-create-page'),
  ),
})

const classroomEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/classrooms/$classroomId/edit',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-edit-page'),
  ),
})

const fullScheduleRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/full-schedule',
  component: lazyRouteComponent(
    () => import('../features/full-schedule/pages/full-schedule-page'),
  ),
})

const staffRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/staff',
  component: lazyRouteComponent(
    () => import('../features/staff/pages/staff-list-page'),
  ),
})

const staffDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/staff/$staffId',
  component: lazyRouteComponent(
    () => import('../features/staff/pages/staff-detail-page'),
  ),
})

const staffEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/staff/$staffId/edit',
  component: lazyRouteComponent(
    () => import('../features/staff/pages/staff-edit-page'),
  ),
})

const tutorsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/tutors',
  component: lazyRouteComponent(
    () => import('../features/tutors/pages/tutor-list-page'),
  ),
})

const tutorDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/tutors/$tutorId',
  component: lazyRouteComponent(
    () => import('../features/tutors/pages/tutor-detail-page'),
  ),
})

const tutorEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/tutors/$tutorId/edit',
  component: lazyRouteComponent(
    () => import('../features/tutors/pages/tutor-edit-page'),
  ),
})

const marketingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketings',
  component: lazyRouteComponent(
    () => import('../features/marketings/pages/marketing-list-page'),
  ),
})

const marketingDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketings/$marketingId',
  component: lazyRouteComponent(
    () => import('../features/marketings/pages/marketing-detail-page'),
  ),
})

const marketingEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketings/$marketingId/edit',
  component: lazyRouteComponent(
    () => import('../features/marketings/pages/marketing-edit-page'),
  ),
})

const staffPermissionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/staff-permissions',
  component: lazyRouteComponent(
    () =>
      import(
        '../features/staff-permissions/pages/staff-permission-list-page'
      ),
  ),
})

const paidLeavesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/paid-leaves',
  component: lazyRouteComponent(
    () => import('../features/paid-leaves/pages/paid-leave-list-page'),
  ),
})

const paidLeaveCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/paid-leaves/new',
  component: lazyRouteComponent(
    () => import('../features/paid-leaves/pages/paid-leave-create-page'),
  ),
})

const paidLeaveEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/paid-leaves/$leaveId/edit',
  component: lazyRouteComponent(
    () => import('../features/paid-leaves/pages/paid-leave-edit-page'),
  ),
})

const branchesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/branches',
  component: lazyRouteComponent(
    () => import('../features/branches/pages/branch-list-page'),
  ),
})

const branchCreateRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/branches/new',
  component: lazyRouteComponent(
    () => import('../features/branches/pages/branch-create-page'),
  ),
})

const branchEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/branches/$branchId/edit',
  component: lazyRouteComponent(
    () => import('../features/branches/pages/branch-edit-page'),
  ),
})

const studentReportRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/student-report',
  component: lazyRouteComponent(
    () => import('../features/student-report/pages/student-report-page'),
  ),
})

const bookkeepingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/bookkeeping',
  component: lazyRouteComponent(
    () => import('../features/bookkeeping/pages/bookkeeping-list-page'),
  ),
})

const tutorReportRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/tutor-report',
  component: lazyRouteComponent(
    () => import('../features/tutor-report/pages/tutor-report-list-page'),
  ),
})

const marketingReportRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/marketing-report',
  component: lazyRouteComponent(
    () =>
      import('../features/marketing-report/pages/marketing-report-list-page'),
  ),
})

const appointmentByTutorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/appointment-by-tutor',
  component: lazyRouteComponent(
    () =>
      import(
        '../features/appointment-by-tutor/pages/appointment-by-tutor-page'
      ),
  ),
})

const profileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/profile',
  component: lazyRouteComponent(
    () => import('../features/profile/pages/profile-page'),
  ),
})

const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications',
  component: lazyRouteComponent(
    () => import('../features/notifications/pages/notifications-page'),
  ),
})

const notificationDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications/$notificationId',
  component: lazyRouteComponent(
    () =>
      import('../features/notifications/pages/notification-detail-page'),
  ),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    studentsRoute,
    studentCreateRoute,
    studentDetailRoute,
    studentEditRoute,
    studentResponsesRoute,
    studentResponseCreateRoute,
    studentResponseEditRoute,
    studentGroupsRoute,
    studentGroupCreateRoute,
    studentGroupEditRoute,
    studentPaymentsRoute,
    studentPaymentCreateRoute,
    studentPaymentEditRoute,
    newStudentsRoute,
    newStudentCreateRoute,
    newStudentEditRoute,
    predictionTestsRoute,
    predictionTestCreateRoute,
    predictionTestEditRoute,
    programsRoute,
    programCreateRoute,
    programEditRoute,
    classroomsRoute,
    classroomCreateRoute,
    classroomEditRoute,
    fullScheduleRoute,
    staffRoute,
    staffDetailRoute,
    staffEditRoute,
    tutorsRoute,
    tutorDetailRoute,
    tutorEditRoute,
    marketingsRoute,
    marketingDetailRoute,
    marketingEditRoute,
    staffPermissionsRoute,
    paidLeavesRoute,
    paidLeaveCreateRoute,
    paidLeaveEditRoute,
    branchesRoute,
    branchCreateRoute,
    branchEditRoute,
    studentReportRoute,
    bookkeepingRoute,
    tutorReportRoute,
    marketingReportRoute,
    appointmentByTutorRoute,
    profileRoute,
    notificationsRoute,
    notificationDetailRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: AppLoadingScreen,
})
