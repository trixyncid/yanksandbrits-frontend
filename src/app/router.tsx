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

const studentResponsesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-responses',
  component: lazyRouteComponent(
    () =>
      import('../features/student-responses/pages/student-response-list-page'),
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

const studentPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-payments',
  component: lazyRouteComponent(
    () =>
      import('../features/student-payments/pages/student-payment-list-page'),
  ),
})

const newStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-students',
  component: lazyRouteComponent(
    () => import('../features/new-students/pages/new-student-list-page'),
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

const programsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs',
  component: lazyRouteComponent(
    () => import('../features/programs/pages/program-list-page'),
  ),
})

const classroomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classrooms',
  component: lazyRouteComponent(
    () => import('../features/classrooms/pages/classroom-list-page'),
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  studentsRoute,
  studentResponsesRoute,
  studentGroupsRoute,
  studentPaymentsRoute,
  newStudentsRoute,
  predictionTestsRoute,
  programsRoute,
  classroomsRoute,
  fullScheduleRoute,
  staffRoute,
  tutorsRoute,
  marketingsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: AppLoadingScreen,
})
