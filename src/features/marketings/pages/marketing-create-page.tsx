import { marketingEntityConfig } from '../../users/lib/staff-entity-config'
import { StaffUserCreatePage } from '../../users/pages/staff-user-create-page'

export default function MarketingCreatePage() {
  return <StaffUserCreatePage entity={marketingEntityConfig} />
}
