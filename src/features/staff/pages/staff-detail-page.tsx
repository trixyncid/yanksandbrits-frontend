import { useParams } from '@tanstack/react-router'

import { staffEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserDetailPage } from '../../users/pages/staff-user-detail-page'

export default function StaffDetailPage() {
  const { userId } = useParams({ strict: false }) as { userId: string }
  return <StaffUserDetailPage userId={userId} entity={staffEntityConfig} />
}
