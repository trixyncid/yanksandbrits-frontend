import type { PermissionModuleKey } from '../lib/permission-catalog'
import {
  canAddModule,
  canChangeModule,
  canDeleteModule,
  canViewModule,
} from '../lib/route-access'
import { useAuthStore } from '../store/auth-store'
import {
  hasAuthPermission,
  hasAuthRole,
  isMarketingFamilyUser,
  isTutorUser,
} from '../types/auth'

export function useAuthUser() {
  return useAuthStore((state) => state.user)
}

export function useCan(permission: string) {
  const user = useAuthStore((state) => state.user)
  return hasAuthPermission(user, permission)
}

export function useModulePermissions(module: PermissionModuleKey) {
  const user = useAuthStore((state) => state.user)

  return {
    canView: canViewModule(user, module),
    canAdd: canAddModule(user, module),
    canChange: canChangeModule(user, module),
    canDelete: canDeleteModule(user, module),
  }
}

export function useIsManager() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  return (
    user.is_superuser ||
    hasAuthRole(user, 'branch-manager') ||
    hasAuthRole(user, 'manager') // legacy
  )
}

export function useIsMarketing() {
  const user = useAuthStore((state) => state.user)
  return isMarketingFamilyUser(user)
}

export function useIsTutor() {
  const user = useAuthStore((state) => state.user)
  return isTutorUser(user)
}

export function useIsAcademicLeader() {
  const user = useAuthStore((state) => state.user)
  return hasAuthRole(user, 'academic-leader')
}

/** Tutor who reviews prediction-test programs, without a broader staff role. */
export function useIsTutorReviewer() {
  const user = useAuthStore((state) => state.user)
  const isTutor = useIsTutor()
  const isManager = useIsManager()
  const isAcademicLeader = useIsAcademicLeader()
  const isEducationCounsellor = useIsRestrictedMarketing()
  if (!user || !isTutor) return false
  if (
    user.is_superuser ||
    isManager ||
    isAcademicLeader ||
    isEducationCounsellor
  ) {
    return false
  }
  return !hasAuthRole(user, 'systemadmin')
}

/** Academic leaders and tutors who review scores and do not manage payment. */
export function useIsProgramReviewer() {
  const isAcademicLeader = useIsAcademicLeader()
  const isTutorReviewer = useIsTutorReviewer()
  return isAcademicLeader || isTutorReviewer
}

export function useIsRestrictedMarketing() {
  const user = useAuthStore((state) => state.user)
  const isManager = useIsManager()
  // CRO (and legacy marketing-manager) can assign any education counsellor.
  if (
    hasAuthRole(user, 'cro') ||
    hasAuthRole(user, 'marketing-manager')
  ) {
    return false
  }
  // Education Counsellor (legacy marketing) is locked to self-attribution.
  const isCounsellor =
    hasAuthRole(user, 'education-counsellor') ||
    hasAuthRole(user, 'marketing')
  return isCounsellor && !isManager
}

/** Education counsellors and branch managers can view payment status but not change it. */
export function useLocksPaymentStatus() {
  const user = useAuthStore((state) => state.user)
  const isRestrictedMarketing = useIsRestrictedMarketing()
  if (!user || user.is_superuser) return false
  if (isRestrictedMarketing) return true
  return (
    hasAuthRole(user, 'branch-manager') ||
    hasAuthRole(user, 'manager') // legacy
  )
}

/** CRO, branch manager, and system admin assign the General English tutor. */
export function useCanAssignGeneralEnglishTutor() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  if (user.is_superuser) return true
  return (
    hasAuthRole(user, 'cro') ||
    hasAuthRole(user, 'marketing-manager') ||
    hasAuthRole(user, 'branch-manager') ||
    hasAuthRole(user, 'manager') ||
    hasAuthRole(user, 'systemadmin')
  )
}

/** Branch manager and system admin approve a tutor allocation before academic leaders can see it. */
export function useCanApproveTutorAllocation() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  if (user.is_superuser) return true
  return (
    hasAuthRole(user, 'branch-manager') ||
    hasAuthRole(user, 'manager') ||
    hasAuthRole(user, 'systemadmin')
  )
}

/** Finance, branch manager, and system admin approve a 2-payment plan. */
export function useCanApproveInstallmentPlan() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  if (user.is_superuser) return true
  return (
    hasAuthRole(user, 'finance') ||
    hasAuthRole(user, 'branch-manager') ||
    hasAuthRole(user, 'manager') ||
    hasAuthRole(user, 'systemadmin')
  )
}

/** Pending-queue sidebar badges — finance / systemadmin (and superuser). */
export function useCanViewNavBadges() {
  const user = useAuthStore((state) => state.user)
  if (!user) return false
  if (user.is_superuser) return true
  return hasAuthRole(user, 'finance') || hasAuthRole(user, 'systemadmin')
}
