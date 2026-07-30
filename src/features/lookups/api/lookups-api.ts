import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'

export type LookupOption = {
  id: string
  name: string
}

type InstitutionDto = {
  id: number
  name: string
  address?: string | null
  phone?: string | null
  total_student?: number
}

type OccupationDto = {
  id: number
  name: string
  total_student?: number
}

export async function fetchInstitutionOptions(): Promise<LookupOption[]> {
  const { items } = await fetchAllPages<InstitutionDto>({
    client: httpClient,
    path: '/institutions',
  })
  return items.map((item) => ({ id: String(item.id), name: item.name }))
}

export async function fetchOccupationOptions(): Promise<LookupOption[]> {
  const { items } = await fetchAllPages<OccupationDto>({
    client: httpClient,
    path: '/occupations',
  })
  return items.map((item) => ({ id: String(item.id), name: item.name }))
}
