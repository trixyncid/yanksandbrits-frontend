import { tutorEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserCreatePage } from '../../users/pages/staff-user-create-page'

export default function TutorCreatePage() {
  return <StaffUserCreatePage entity={tutorEntityConfig} />
}
