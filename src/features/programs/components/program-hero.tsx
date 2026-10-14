import { BookOpen, CircleCheck, Plus, Tag } from 'lucide-react'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { Can } from '../../auth/components/can'

export function ProgramHero({
  total,
  active,
  withoutSubject,
  statusFilter,
  subjectFilter,
  onShowAll,
  onShowActive,
  onShowWithoutSubject,
  onAdd,
}: {
  total: number | string
  active: number | string
  withoutSubject: number | string
  statusFilter: string
  subjectFilter: string
  onShowAll: () => void
  onShowActive: () => void
  onShowWithoutSubject: () => void
  onAdd: () => void
}) {
  return (
    <PageHero
      eyebrow="Academics"
      title="Programs"
      description="The courses students enroll in and tutors teach, with the colors they use on the schedule."
      theme="harbor"
      pattern="arcs"
      stats={[
        {
          id: 'all',
          label: 'Programs',
          value: total,
          icon: BookOpen,
          hint: 'Show all programs',
          active: !statusFilter && !subjectFilter,
          onSelect: onShowAll,
        },
        {
          id: 'active',
          label: 'Active',
          value: active,
          icon: CircleCheck,
          hint: 'Show active programs only',
          active: statusFilter === 'active' && !subjectFilter,
          onSelect: onShowActive,
        },
        {
          id: 'no-subject',
          label: 'No subject',
          value: withoutSubject,
          icon: Tag,
          hint: 'Show programs that still need a subject',
          active: subjectFilter === 'none' && !statusFilter,
          onSelect: onShowWithoutSubject,
        },
      ]}
      spotlight={
        <Can module="programs" action="add">
          <HeroSpotlight
            title="Add a new program"
            description="Set its subject and schedule colors in one go."
            actions={
              <HeroPillButton icon={Plus} onClick={onAdd}>
                Add program
              </HeroPillButton>
            }
          />
        </Can>
      }
    />
  )
}
