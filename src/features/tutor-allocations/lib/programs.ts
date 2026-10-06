export const TUTOR_ALLOCATION_PROGRAM_CODES = [
  'IEL_F',
  'IEL_A',
  'IEL_B',
  'TOE_G',
  'TOE_R',
  'HSK_1',
  'HSK_2',
  'HSK_3',
  'HSK_4',
  'HSK_5',
  'HSK_6',
  'GEN',
] as const

export const TUTOR_ALLOCATION_PROGRAM_OPTIONS: {
  value: (typeof TUTOR_ALLOCATION_PROGRAM_CODES)[number]
  label: string
}[] = [
  { value: 'IEL_F', label: 'IELTS Foundation' },
  { value: 'IEL_A', label: 'IELTS A' },
  { value: 'IEL_B', label: 'IELTS B' },
  { value: 'TOE_G', label: 'TOEFL ITP - Green' },
  { value: 'TOE_R', label: 'TOEFL ITP - RED' },
  { value: 'HSK_1', label: 'HSK 1' },
  { value: 'HSK_2', label: 'HSK 2' },
  { value: 'HSK_3', label: 'HSK 3' },
  { value: 'HSK_4', label: 'HSK 4' },
  { value: 'HSK_5', label: 'HSK 5' },
  { value: 'HSK_6', label: 'HSK 6' },
  { value: 'GEN', label: 'General English' },
] 

export type TutorAllocationProgram =
  (typeof TUTOR_ALLOCATION_PROGRAM_CODES)[number]

export function programLabel(program: string | null | undefined) {
  if (!program) return '—'
  return (
    TUTOR_ALLOCATION_PROGRAM_OPTIONS.find((option) => option.value === program)
      ?.label ?? program
  )
}

export function courseForProgram(program: string | null | undefined) {
  if (program === 'IEL_F' || program === 'IEL_A' || program === 'IEL_B') {
    return 'IEL'
  }
  if (program === 'TOE_G' || program === 'TOE_R') {
    return 'TOE'
  }
  if (
    program === 'HSK_1' ||
    program === 'HSK_2' ||
    program === 'HSK_3' ||
    program === 'HSK_4' ||
    program === 'HSK_5' ||
    program === 'HSK_6'
  ) {
    return 'HSK'
  }
  if (program === 'GEN') {
    return 'GEN'
  }
  return null
}
