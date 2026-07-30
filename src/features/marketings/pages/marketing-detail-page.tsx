import { useParams } from '@tanstack/react-router'

import { marketingEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserDetailPage } from '../../users/pages/staff-user-detail-page'

export default function MarketingDetailPage() {
  const { marketingId } = useParams({ strict: false }) as {
    marketingId: string
  }
  return (
    <StaffUserDetailPage userId={marketingId} entity={marketingEntityConfig} />
  )
}
