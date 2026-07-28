import { httpClient } from '../../../shared/api/http-client'
import type {
  LoginFormValues,
  LoginResult,
} from '../types/login-form-values'

const PLACEHOLDER_DELAY_MS = 900

export async function loginPlaceholder(
  values: LoginFormValues,
): Promise<LoginResult> {
  await new Promise((resolve) => window.setTimeout(resolve, PLACEHOLDER_DELAY_MS))

  const configuredBaseUrl = httpClient.defaults.baseURL

  return {
    ok: true,
    type: 'success',
    message: configuredBaseUrl
      ? `Placeholder login submitted for ${values.email}. API integration will use ${configuredBaseUrl}.`
      : `Placeholder login submitted for ${values.email}. API integration will be connected later.`,
  }
}
