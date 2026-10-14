import { GraduationCap, UserCog, UsersRound, type LucideIcon } from 'lucide-react'

import type { PagePattern, PageTheme } from '../../../shared/components/page'
import type { StaffEntityKind } from './staff-entity-config'

/** Visual identity per people section so staff, tutors and counsellors differ. */
export const STAFF_ENTITY_THEME: Record<
  StaffEntityKind,
  { theme: PageTheme; pattern: PagePattern; icon: LucideIcon }
> = {
  staff: { theme: 'ink', pattern: 'dots', icon: UserCog },
  tutor: { theme: 'sky', pattern: 'dots', icon: GraduationCap },
  marketing: { theme: 'dawn', pattern: 'waves', icon: UsersRound },
}
