import axios from 'axios'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { httpClient } from '../../../shared/api/http-client'
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
  }>('/auth/login', credentials)

  return data.data
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await httpClient.get<{
    success: true
    data: { user: AuthUser }
    meta: unknown
  }>('/auth/me')

  return data.data.user
}

export async function logout(): Promise<void> {
  await httpClient.post('/auth/logout', {})
}

export type ChangePasswordPayload = {
  current_password: string
  new_password: string
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await httpClient.post('/auth/change-password', payload)
}

/** Refresh without the shared httpClient interceptors (avoids 401 loops). */
export async function refreshSession(rememberMe = true): Promise<void> {
  await axios.post(
    `${getApiBaseUrl()}/auth/refresh`,
    { remember_me: rememberMe },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      withCredentials: true,
    },
  )
}
