import type { LookupOption } from '../../lookups/api/lookups-api'

/** Matches the backend rule: any resource whose name mentions "referral". */
export function isReferralResource(
  resourceId: string,
  resources: LookupOption[] | undefined,
) {
  if (!resourceId) {
    return false
  }
  const resource = resources?.find((option) => option.id === resourceId)
  return Boolean(resource?.name.toLowerCase().includes('referral'))
}
