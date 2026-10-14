import { Building2, CircleCheck, DoorOpen, Plus } from 'lucide-react'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { Can } from '../../auth/components/can'

export function ClassroomHero({
  total,
  active,
  branches,
  statusFilter,
  branchFilter,
  onShowAll,
  onShowActive,
  onAdd,
}: {
  total: number | string
  active: number | string
  branches: number | string
  statusFilter: string
  branchFilter: string
  onShowAll: () => void
  onShowActive: () => void
  onAdd: () => void
}) {
  return (
    <PageHero
      eyebrow="Academics"
      title="Classrooms"
      description="The rooms at each branch that classes can be booked into."
      theme="mist"
      pattern="grid"
      stats={[
        {
          id: 'all',
          label: 'Rooms',
          value: total,
          icon: DoorOpen,
          hint: 'Show all classrooms',
          active: !statusFilter && !branchFilter,
          onSelect: onShowAll,
        },
        {
          id: 'active',
          label: 'Bookable',
          value: active,
          icon: CircleCheck,
          caption: 'Active and ready for classes',
          hint: 'Show active classrooms only',
          active: statusFilter === 'active' && !branchFilter,
          onSelect: onShowActive,
        },
        {
          id: 'branches',
          label: 'Branches',
          value: branches,
          icon: Building2,
          caption: 'With at least one room',
        },
      ]}
      spotlight={
        <Can module="classrooms" action="add">
          <HeroSpotlight
            title="Add a classroom"
            description="Give it a code and pick its branch."
            actions={
              <HeroPillButton icon={Plus} onClick={onAdd}>
                Add classroom
              </HeroPillButton>
            }
          />
        </Can>
      }
    />
  )
}
