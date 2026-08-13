import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import { adminPath } from '../../../shared/api/paths'

export type LookupOption = {
  id: string
  name: string
}

export type InstitutionItem = {
  id: string
  name: string
  address: string
  phone: string
  totalStudent: number
}

export type OccupationItem = {
  id: string
  name: string
  totalStudent: number
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

function mapInstitution(item: InstitutionDto): InstitutionItem {
  return {
    id: String(item.id),
    name: item.name,
    address: item.address ?? '',
    phone: item.phone ?? '',
    totalStudent: item.total_student ?? 0,
  }
}

function mapOccupation(item: OccupationDto): OccupationItem {
  return {
    id: String(item.id),
    name: item.name,
    totalStudent: item.total_student ?? 0,
  }
}

export async function fetchInstitutionOptions(): Promise<LookupOption[]> {
  const items = await fetchInstitutions()
  return items.map((item) => ({ id: item.id, name: item.name }))
}

export async function fetchOccupationOptions(): Promise<LookupOption[]> {
  const items = await fetchOccupations()
  return items.map((item) => ({ id: item.id, name: item.name }))
}

export async function fetchInstitutions(): Promise<InstitutionItem[]> {
  const { items } = await fetchAllPages<InstitutionDto>({
    client: httpClient,
    path: adminPath('/institutions'),
  })
  return items.map(mapInstitution)
}

export async function fetchOccupations(): Promise<OccupationItem[]> {
  const { items } = await fetchAllPages<OccupationDto>({
    client: httpClient,
    path: adminPath('/occupations'),
  })
  return items.map(mapOccupation)
}

export async function createInstitution(values: {
  name: string
  address: string
  phone: string
}): Promise<InstitutionItem> {
  const { data } = await httpClient.post<{ data: InstitutionDto }>(
    adminPath('/institutions'),
    {
      name: values.name.trim(),
      address: values.address.trim() || null,
      phone: values.phone.trim() || null,
    },
  )
  return mapInstitution(data.data)
}

export async function updateInstitution(
  id: string,
  values: { name: string; address: string; phone: string },
): Promise<InstitutionItem> {
  const { data } = await httpClient.patch<{ data: InstitutionDto }>(
    adminPath(`/institutions/${id}`),
    {
      name: values.name.trim(),
      address: values.address.trim() || null,
      phone: values.phone.trim() || null,
    },
  )
  return mapInstitution(data.data)
}

export async function deleteInstitution(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/institutions/${id}`))
}

export async function createOccupation(values: {
  name: string
}): Promise<OccupationItem> {
  const { data } = await httpClient.post<{ data: OccupationDto }>(
    adminPath('/occupations'),
    {
      name: values.name.trim(),
    },
  )
  return mapOccupation(data.data)
}

export async function updateOccupation(
  id: string,
  values: { name: string },
): Promise<OccupationItem> {
  const { data } = await httpClient.patch<{ data: OccupationDto }>(
    adminPath(`/occupations/${id}`),
    {
      name: values.name.trim(),
    },
  )
  return mapOccupation(data.data)
}

export async function deleteOccupation(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/occupations/${id}`))
}
