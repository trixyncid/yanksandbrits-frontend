import { staffEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserCreatePage } from '../../users/pages/staff-user-create-page'

export default function StaffCreatePage() {
  return <StaffUserCreatePage entity={staffEntityConfig} />
}
