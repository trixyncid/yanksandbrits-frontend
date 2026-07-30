import { useParams } from '@tanstack/react-router'

import { marketingEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserEditPage } from '../../users/pages/staff-user-edit-page'

export default function MarketingEditPage() {
  const { marketingId } = useParams({ strict: false }) as {
    marketingId: string
  }
  return (
    <StaffUserEditPage userId={marketingId} entity={marketingEntityConfig} />
  )
}
