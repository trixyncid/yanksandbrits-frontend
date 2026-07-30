import { useParams } from '@tanstack/react-router'

import { staffEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserEditPage } from '../../users/pages/staff-user-edit-page'

export default function StaffEditPage() {
  const { staffId } = useParams({ strict: false }) as { staffId: string }
  return <StaffUserEditPage userId={staffId} entity={staffEntityConfig} />
}
