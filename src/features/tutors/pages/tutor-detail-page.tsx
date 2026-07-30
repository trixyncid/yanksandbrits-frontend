import { useParams } from '@tanstack/react-router'

import { tutorEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserDetailPage } from '../../users/pages/staff-user-detail-page'

export default function TutorDetailPage() {
  const { tutorId } = useParams({ strict: false }) as { tutorId: string }
  return <StaffUserDetailPage userId={tutorId} entity={tutorEntityConfig} />
}
