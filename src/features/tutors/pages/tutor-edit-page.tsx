import { useParams } from '@tanstack/react-router'

import { tutorEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserEditPage } from '../../users/pages/staff-user-edit-page'

export default function TutorEditPage() {
  const { tutorId } = useParams({ strict: false }) as { tutorId: string }
  return <StaffUserEditPage userId={tutorId} entity={tutorEntityConfig} />
}
