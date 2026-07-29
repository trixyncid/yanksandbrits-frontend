import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router'

import { RootLayout } from './root-layout'
import { AppLoadingScreen } from './ui/app-loading-screen'

const rootRoute = createRootRoute({
  component: RootLayout,
  pendingComponent: AppLoadingScreen,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: lazyRouteComponent(() => import('../features/auth/pages/login-page')),
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: lazyRouteComponent(
    () => import('../features/admin/pages/dashboard-page'),
  ),
})

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-list-page'),
  ),
})

const studentCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students/new',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-create-page'),
  ),
})

const studentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students/$studentId',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-detail-page'),
  ),
})

const studentEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students/$studentId/edit',
  component: lazyRouteComponent(
    () => import('../features/students/pages/student-edit-page'),
  ),
})

const studentResponsesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-responses',
  component: lazyRouteComponent(
    () =>
      import('../features/student-responses/pages/student-response-list-page'),
  ),
})

const studentResponseCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-responses/new',
  component: lazyRouteComponent(
    () =>
      import(
        '../features/student-responses/pages/student-response-create-page'
      ),
  ),
})

const studentResponseEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-responses/$responseId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/student-responses/pages/student-response-edit-page'),
  ),
})

const studentGroupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-groups',
  component: lazyRouteComponent(
    () =>
      import('../features/student-groups/pages/student-group-list-page'),
  ),
})

const studentGroupCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-groups/new',
  component: lazyRouteComponent(
    () =>
      import('../features/student-groups/pages/student-group-create-page'),
  ),
})

const studentGroupEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-groups/$groupId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/student-groups/pages/student-group-edit-page'),
  ),
})

const studentPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-payments',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-list-page'),
  ),
})

const studentPaymentCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-payments/new',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-create-page'),
  ),
})

const studentPaymentEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-payments/$paymentId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-edit-page'),
  ),
})

const newStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-students',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-list-page'),
  ),
})

const newStudentCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-students/new',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-create-page'),
  ),
})

const newStudentEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-students/$studentId/edit',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-edit-page'),
  ),
})

const predictionTestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prediction-tests',
  component: lazyRouteComponent(
    () =>
      import('../features/prediction-tests/pages/prediction-test-list-page'),
  ),
})

const predictionTestCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prediction-tests/new',
  component: lazyRouteComponent(
    () =>
      import('../features/prediction-tests/pages/prediction-test-create-page'),
  ),
})

const predictionTestEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prediction-tests/$testId/edit',
  component: lazyRouteComponent(
    () =>
      import('../features/prediction-tests/pages/prediction-test-edit-page'),
  ),
})

const programsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-list-page'),
  ),
})

const programCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs/new',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-create-page'),
  ),
})

const programEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs/$programId/edit',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-edit-page'),
  ),
})

const classroomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classrooms',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-list-page'),
  ),
})

const classroomCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classrooms/new',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-create-page'),
  ),
})

const classroomEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classrooms/$classroomId/edit',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-edit-page'),
  ),
})

const fullScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/full-schedule',
  component: lazyRouteComponent(
    () => import('../features/full-schedule/pages/full-schedule-page'),
  ),
})

const staffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff',
  component: lazyRouteComponent(
    () => import('../features/staff/pages/staff-list-page'),
  ),
})

const tutorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tutors',
  component: lazyRouteComponent(
    () => import('../features/tutors/pages/tutor-list-page'),
  ),
})

const marketingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketings',
  component: lazyRouteComponent(
    () => import('../features/marketings/pages/marketing-list-page'),
  ),
})

const staffPermissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff-permissions',
  component: lazyRouteComponent(
    () =>
      import(
        '../features/staff-permissions/pages/staff-permission-list-page'
      ),
  ),
})

const paidLeavesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paid-leaves',
  component: lazyRouteComponent(
    () => import('../features/paid-leaves/pages/paid-leave-list-page'),
  ),
})

const branchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/branches',
  component: lazyRouteComponent(
    () => import('../features/branches/pages/branch-list-page'),
  ),
})

const studentReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-report',
  component: lazyRouteComponent(
    () => import('../features/student-report/pages/student-report-page'),
  ),
})

const bookkeepingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookkeeping',
  component: lazyRouteComponent(
    () => import('../features/bookkeeping/pages/bookkeeping-list-page'),
  ),
})

const tutorReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tutor-report',
  component: lazyRouteComponent(
    () => import('../features/tutor-report/pages/tutor-report-list-page'),
  ),
})

const marketingReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketing-report',
  component: lazyRouteComponent(
    () =>
      import('../features/marketing-report/pages/marketing-report-list-page'),
  ),
})

const appointmentByTutorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointment-by-tutor',
  component: lazyRouteComponent(
    () =>
      import(
        '../features/appointment-by-tutor/pages/appointment-by-tutor-page'
      ),
  ),
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: lazyRouteComponent(
    () => import('../features/profile/pages/profile-page'),
  ),
})

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: lazyRouteComponent(
    () => import('../features/notifications/pages/notifications-page'),
  ),
})

const notificationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications/$notificationId',
  component: lazyRouteComponent(
    () =>
      import('../features/notifications/pages/notification-detail-page'),
  ),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
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
  tutorsRoute,
  marketingsRoute,
  staffPermissionsRoute,
  paidLeavesRoute,
  branchesRoute,
  studentReportRoute,
  bookkeepingRoute,
  tutorReportRoute,
  marketingReportRoute,
  appointmentByTutorRoute,
  profileRoute,
  notificationsRoute,
  notificationDetailRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: AppLoadingScreen,
})
