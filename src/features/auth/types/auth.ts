export type AuthUser = {
  id: number
  email: string
  full_name: string
  branch_id: number | null
  is_tutor: boolean
  is_marketing: boolean
  is_manager: boolean
  is_superuser: boolean
  is_student: boolean
  student_id: number | null
}

export type LoginResponse = {
  user: AuthUser
}

export type AuthSession = {
  user: AuthUser
  rememberMe: boolean
}
