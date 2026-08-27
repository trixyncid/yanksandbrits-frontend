import axios from 'axios'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { httpClient } from '../../../shared/api/http-client'
import { AUTH_PATHS } from '../../../shared/api/paths'
import type { AuthUser, LoginResponse } from '../types/auth'

export type LoginCredentials = {
  email: string
  password: string
  remember_me?: boolean
}

export { getApiErrorMessage }

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? ''
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await httpClient.post<{
    success: true
    data: LoginResponse
    meta: unknown
  }>(AUTH_PATHS.login, credentials)

  return data.data
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await httpClient.get<{
    success: true
    data: { user: AuthUser }
    meta: unknown
  }>(AUTH_PATHS.me)

  return data.data.user
}

export async function logout(): Promise<void> {
  await httpClient.post(AUTH_PATHS.logout, {})
}

export type ChangePasswordPayload = {
  current_password: string
  new_password: string
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await httpClient.post(AUTH_PATHS.changePassword, payload)
}

export async function requestPasswordReset(email: string): Promise<void> {
  await httpClient.post(AUTH_PATHS.forgotPassword, { email })
}

export type ResetPasswordPayload = {
  uid: string
  token: string
  new_password: string
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  await httpClient.post(AUTH_PATHS.resetPassword, payload)
}

export type UpdateMePayload = {
  full_name: string
  gender: 'M' | 'F' | null
  birth_place: string | null
  birth_date: string | null
  address: string | null
  mobile_phone: string | null
  home_phone: string | null
  other_phone: string | null
}

export async function updateMe(payload: UpdateMePayload): Promise<AuthUser> {
  const { data } = await httpClient.patch<{
    success: true
    data: { user: AuthUser }
    meta: unknown
  }>(AUTH_PATHS.me, payload)

  return data.data.user
}

/** Refresh without the shared httpClient interceptors (avoids 401 loops). */
export async function refreshSession(rememberMe = true): Promise<void> {
  await axios.post(
    `${getApiBaseUrl()}${AUTH_PATHS.refresh}`,
    { remember_me: rememberMe },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      withCredentials: true,
    },
  )
}
