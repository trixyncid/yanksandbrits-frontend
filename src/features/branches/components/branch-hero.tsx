import { Building2, Plus, UserRoundX, Users } from 'lucide-react'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { Can } from '../../auth/components/can'

export function BranchHero({
  total,
  students,
  withoutStudents,
  mainBranchName,
  studentFilter,
  onShowAll,
  onShowWithoutStudents,
  onAdd,
}: {
  total: number | string
  students: number | string
  withoutStudents: number | string
  mainBranchName: string | null
  studentFilter: string
  onShowAll: () => void
  onShowWithoutStudents: () => void
  onAdd: () => void
}) {
  return (
    <PageHero
      eyebrow="Settings"
      title="Branches"
      description="Your school locations. Students, staff and the schedule are organised by branch."
      theme="ink"
      pattern="rings"
      stats={[
        {
          id: 'all',
          label: 'Branches',
          value: total,
          icon: Building2,
          caption: mainBranchName ? `Main: ${mainBranchName}` : undefined,
          hint: 'Show all branches',
          active: !studentFilter,
          onSelect: onShowAll,
        },
        {
          id: 'students',
          label: 'Students',
          value: students,
          icon: Users,
          caption: 'Across all branches',
        },
        {
          id: 'empty',
          label: 'No students yet',
          value: withoutStudents,
          icon: UserRoundX,
          hint: 'Show branches without students',
          active: studentFilter === 'none',
          onSelect: onShowWithoutStudents,
        },
      ]}
      spotlight={
        <Can module="branches" action="add">
          <HeroSpotlight
            title="Open a new branch"
            description="Add its name, phone and address in a minute."
            actions={
              <HeroPillButton icon={Plus} onClick={onAdd}>
                Add branch
              </HeroPillButton>
            }
          />
        </Can>
      }
    />
  )
}
