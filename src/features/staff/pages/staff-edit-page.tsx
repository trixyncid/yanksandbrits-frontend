import { useParams } from '@tanstack/react-router'

import { staffEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserEditPage } from '../../users/pages/staff-user-edit-page'

export default function StaffEditPage() {
  const { userId } = useParams({ strict: false }) as { userId: string }
  return <StaffUserEditPage userId={userId} entity={staffEntityConfig} />
}
