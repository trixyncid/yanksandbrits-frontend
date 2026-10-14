import {
  CircleCheckBig,
  Hourglass,
  Layers,
  Plus,
  UserRoundSearch,
} from 'lucide-react'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { Can } from '../../auth/components/can'
import type { AllocationStage } from '../lib/allocation-status'

export function TutorAllocationHero({
  total,
  awaiting,
  needTutors,
  assigned,
  stageFilter,
  onFilter,
  onAdd,
}: {
  total: number | string
  awaiting: number | string
  needTutors: number | string
  assigned: number | string
  stageFilter: AllocationStage | ''
  onFilter: (stage: AllocationStage | '') => void
  onAdd: () => void
}) {
  return (
    <PageHero
      eyebrow="Academics"
      title="Tutor Allocation"
      description="Each class moves from approval, to tutors, to the program being assigned to its students. New classes stay hidden from academic leaders until a branch manager or system admin approves them."
      theme="harbor"
      pattern="ribbons"
      stats={[
        {
          id: 'all',
          label: 'Classes',
          value: total,
          icon: Layers,
          hint: 'Show all classes',
          active: !stageFilter,
          onSelect: () => onFilter(''),
        },
        {
          id: 'awaiting',
          label: 'To approve',
          value: awaiting,
          icon: Hourglass,
          caption: 'Waiting for a branch manager',
          hint: 'Show classes awaiting approval',
          active: stageFilter === 'awaiting',
          onSelect: () => onFilter('awaiting'),
        },
        {
          id: 'approved',
          label: 'Need tutors',
          value: needTutors,
          icon: UserRoundSearch,
          caption: 'Approved, tutors not set',
          hint: 'Show approved classes that still need tutors',
          active: stageFilter === 'approved',
          onSelect: () => onFilter('approved'),
        },
        {
          id: 'assigned',
          label: 'Running',
          value: assigned,
          icon: CircleCheckBig,
          caption: 'Program assigned to students',
          hint: 'Show classes with programs assigned',
          active: stageFilter === 'assigned',
          onSelect: () => onFilter('assigned'),
        },
      ]}
      spotlight={
        <Can module="tutorAllocations" action="add">
          <HeroSpotlight
            title="Start a new class"
            description="Pick the students, sessions and weekly times."
            actions={
              <HeroPillButton icon={Plus} onClick={onAdd}>
                Add class
              </HeroPillButton>
            }
          />
        </Can>
      }
    />
  )
}
