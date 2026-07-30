import { useParams } from '@tanstack/react-router'

import { staffEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserDetailPage } from '../../users/pages/staff-user-detail-page'

export default function StaffDetailPage() {
  const { staffId } = useParams({ strict: false }) as { staffId: string }
  return <StaffUserDetailPage userId={staffId} entity={staffEntityConfig} />
}
