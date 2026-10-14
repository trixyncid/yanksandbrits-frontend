import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import {
  emptyScheduleAvailability,
  scheduleAvailabilityFromApi,
  type ScheduleAvailability,
} from '../../prediction-tests/lib/schedule'
import {
  TUTOR_ALLOCATION_PROGRAM_OPTIONS,
  type TutorAllocationProgram,
} from '../lib/programs'
import type {
  EligibleAllocationStudent,
  TutorAllocationFormValues,
  TutorAllocationListItem,
  TutorAllocationScore,
} from '../types/tutor-allocation'

export type TutorAllocationListResponse = {
  data: TutorAllocationListItem[]
  meta: { total: number }
}

type MemberDto = {
  student: number
  position: number
  student_name: string
  pin?: string
  grn: string
  course: string | null
  prediction_test_id: number | null
  listening: string | null
  reading: string | null
  writing: string | null
  speaking: string | null
  math: string | null
  written_test_score: string | null
}

type ComputerScienceProgramDto = {
  position: number
  program: number
  program_code: string
  program_title: string
  program_subject?: string
  sessions: number
  tutor: number | null
  tutor_name: string
  note?: string
}

type TutorAllocationDto = {
  id: number
  class_type: 'private' | 'group'
  group_size: number
  program: string
  branch: number | null
  branch_name: string | null
  course: string | null
  members: MemberDto[]
  sessions_per_week: string | null
  availability: ScheduleAvailability | null
  schedule_note: string | null
  listening_tutor: number | null
  reading_tutor: number | null
  writing_tutor: number | null
  speaking_tutor: number | null
  math_tutor: number | null
  listening_tutor_name: string
  reading_tutor_name: string
  writing_tutor_name: string
  speaking_tutor_name: string
  math_tutor_name: string
  listening_program?: number | null
  reading_program?: number | null
  writing_program?: number | null
  speaking_program?: number | null
  math_program?: number | null
  listening_program_code?: string
  reading_program_code?: string
  writing_program_code?: string
  speaking_program_code?: string
  math_program_code?: string
  listening_program_title?: string
  reading_program_title?: string
  writing_program_title?: string
  speaking_program_title?: string
  math_program_title?: string
  listening_note?: string
  reading_note?: string
  writing_note?: string
  speaking_note?: string
  math_note?: string
  listening_sessions: number
  reading_sessions: number
  writing_sessions: number
  speaking_sessions: number
  math_sessions: number
  general_english_unit_1: string
  general_english_unit_1_sessions: number
  general_english_unit_1_tutor: number | null
  general_english_unit_1_tutor_name: string
  general_english_unit_1_program?: number | null
  general_english_unit_1_program_code?: string
  general_english_unit_1_program_title?: string
  general_english_unit_1_note?: string
  general_english_unit_2: string
  general_english_unit_2_sessions: number
  general_english_unit_2_tutor: number | null
  general_english_unit_2_tutor_name: string
  general_english_unit_2_program?: number | null
  general_english_unit_2_program_code?: string
  general_english_unit_2_program_title?: string
  general_english_unit_2_note?: string
  general_english_grammar_sessions: number
  general_english_grammar_tutor: number | null
  general_english_grammar_tutor_name: string
  general_english_grammar_program?: number | null
  general_english_grammar_program_code?: string
  general_english_grammar_program_title?: string
  general_english_grammar_note?: string
  computer_science_programs?: ComputerScienceProgramDto[]
  subjects?: string[]
  approved: boolean
  approved_at: string | null
  approved_by_name: string
  tutors_allocated?: boolean
  tutors_allocated_at?: string | null
  tutors_allocated_by_name?: string
  programs_assigned?: boolean
  programs_assigned_at?: string | null
  programs_assigned_by_name?: string
  created_at: string
  updated_at: string
  created_by_name: string
  updated_by_name: string
}

function programFromApi(value: string | null | undefined): TutorAllocationProgram | '' {
  return TUTOR_ALLOCATION_PROGRAM_OPTIONS.some((option) => option.value === value)
    ? (value as TutorAllocationProgram)
    : ''
}

function idString(value: number | null | undefined) {
  return value == null ? '' : String(value)
}

function mapMember(dto: MemberDto): TutorAllocationScore {
  return {
    studentId: String(dto.student),
    position: dto.position,
    studentName: dto.student_name,
    pin: dto.pin ?? '',
    grn: dto.grn ?? '',
    course: dto.course,
    predictionTestId:
      dto.prediction_test_id == null ? null : String(dto.prediction_test_id),
    listening: dto.listening,
    reading: dto.reading,
    writing: dto.writing,
    speaking: dto.speaking,
    math: dto.math,
    writtenTestScore: dto.written_test_score,
  }
}

function mapAllocation(dto: TutorAllocationDto): TutorAllocationListItem {
  return {
    id: String(dto.id),
    classType: dto.class_type,
    groupSize: dto.group_size,
    program: programFromApi(dto.program),
    branchId: dto.branch == null ? null : String(dto.branch),
    branchName: dto.branch_name ?? '',
    course: dto.course,
    members: [...dto.members].sort((left, right) => left.position - right.position).map(mapMember),
    sessionsPerWeek: dto.sessions_per_week ?? '',
    availability: scheduleAvailabilityFromApi(dto.availability),
    scheduleNote: dto.schedule_note ?? '',
    listeningTutorId: idString(dto.listening_tutor),
    readingTutorId: idString(dto.reading_tutor),
    writingTutorId: idString(dto.writing_tutor),
    speakingTutorId: idString(dto.speaking_tutor),
    mathTutorId: idString(dto.math_tutor),
    listeningTutorName: dto.listening_tutor_name ?? '',
    readingTutorName: dto.reading_tutor_name ?? '',
    writingTutorName: dto.writing_tutor_name ?? '',
    speakingTutorName: dto.speaking_tutor_name ?? '',
    mathTutorName: dto.math_tutor_name ?? '',
    listeningProgramId: idString(dto.listening_program),
    readingProgramId: idString(dto.reading_program),
    writingProgramId: idString(dto.writing_program),
    speakingProgramId: idString(dto.speaking_program),
    mathProgramId: idString(dto.math_program),
    listeningProgramCode: dto.listening_program_code ?? '',
    readingProgramCode: dto.reading_program_code ?? '',
    writingProgramCode: dto.writing_program_code ?? '',
    speakingProgramCode: dto.speaking_program_code ?? '',
    mathProgramCode: dto.math_program_code ?? '',
    listeningProgramTitle: dto.listening_program_title ?? '',
    readingProgramTitle: dto.reading_program_title ?? '',
    writingProgramTitle: dto.writing_program_title ?? '',
    speakingProgramTitle: dto.speaking_program_title ?? '',
    mathProgramTitle: dto.math_program_title ?? '',
    listeningNote: dto.listening_note ?? '',
    readingNote: dto.reading_note ?? '',
    writingNote: dto.writing_note ?? '',
    speakingNote: dto.speaking_note ?? '',
    mathNote: dto.math_note ?? '',
    listeningSessions: dto.listening_sessions ?? 0,
    readingSessions: dto.reading_sessions ?? 0,
    writingSessions: dto.writing_sessions ?? 0,
    speakingSessions: dto.speaking_sessions ?? 0,
    mathSessions: dto.math_sessions ?? 0,
    generalEnglishUnit1: dto.general_english_unit_1 ?? '',
    generalEnglishUnit1Sessions: dto.general_english_unit_1_sessions ?? 0,
    generalEnglishUnit1TutorId: idString(dto.general_english_unit_1_tutor),
    generalEnglishUnit1TutorName: dto.general_english_unit_1_tutor_name ?? '',
    generalEnglishUnit1ProgramId: idString(dto.general_english_unit_1_program),
    generalEnglishUnit1ProgramCode: dto.general_english_unit_1_program_code ?? '',
    generalEnglishUnit1ProgramTitle: dto.general_english_unit_1_program_title ?? '',
    generalEnglishUnit1Note: dto.general_english_unit_1_note ?? '',
    generalEnglishUnit2: dto.general_english_unit_2 ?? '',
    generalEnglishUnit2Sessions: dto.general_english_unit_2_sessions ?? 0,
    generalEnglishUnit2TutorId: idString(dto.general_english_unit_2_tutor),
    generalEnglishUnit2TutorName: dto.general_english_unit_2_tutor_name ?? '',
    generalEnglishUnit2ProgramId: idString(dto.general_english_unit_2_program),
    generalEnglishUnit2ProgramCode: dto.general_english_unit_2_program_code ?? '',
    generalEnglishUnit2ProgramTitle: dto.general_english_unit_2_program_title ?? '',
    generalEnglishUnit2Note: dto.general_english_unit_2_note ?? '',
    generalEnglishGrammarSessions: dto.general_english_grammar_sessions ?? 0,
    generalEnglishGrammarTutorId: idString(dto.general_english_grammar_tutor),
    generalEnglishGrammarTutorName: dto.general_english_grammar_tutor_name ?? '',
    generalEnglishGrammarProgramId: idString(dto.general_english_grammar_program),
    generalEnglishGrammarProgramCode: dto.general_english_grammar_program_code ?? '',
    generalEnglishGrammarProgramTitle:
      dto.general_english_grammar_program_title ?? '',
    generalEnglishGrammarNote: dto.general_english_grammar_note ?? '',
    computerSciencePrograms: [...(dto.computer_science_programs ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((line) => ({
        position: line.position,
        programId: idString(line.program),
        programCode: line.program_code ?? '',
        programTitle: line.program_title ?? '',
        programSubject: line.program_subject ?? '',
        sessions: line.sessions ?? 0,
        tutorId: idString(line.tutor),
        tutorName: line.tutor_name ?? '',
        note: line.note ?? '',
      })),
    subjects: dto.subjects ?? [],
    approved: Boolean(dto.approved),
    approvedAt: dto.approved_at ?? '',
    approvedBy: dto.approved_by_name ?? '',
    tutorsAllocated: Boolean(dto.tutors_allocated),
    tutorsAllocatedAt: dto.tutors_allocated_at ?? '',
    tutorsAllocatedBy: dto.tutors_allocated_by_name ?? '',
    programsAssigned: Boolean(dto.programs_assigned),
    programsAssignedAt: dto.programs_assigned_at ?? '',
    programsAssignedBy: dto.programs_assigned_by_name ?? '',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.created_by_name ?? '',
    updatedBy: dto.updated_by_name ?? '',
  }
}

function countToApi(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function tutorToApi(value: string) {
  return value.trim() ? Number(value) : null
}

function programToApi(value: string) {
  return value.trim() ? Number(value) : null
}

function toWritePayload(values: TutorAllocationFormValues) {
  const seats = values.classType === 'private' ? 1 : Number(values.groupSize)
  return {
    class_type: values.classType,
    program: values.program,
    group_size: seats,
    members: values.studentIds.slice(0, seats).map((studentId, index) => ({
      student: Number(studentId),
      position: index + 1,
    })),
    sessions_per_week: values.sessionsPerWeek || null,
    availability: values.availability,
    schedule_note: values.scheduleNote.trim() || null,
    listening_tutor: tutorToApi(values.listeningTutorId),
    reading_tutor: tutorToApi(values.readingTutorId),
    writing_tutor: tutorToApi(values.writingTutorId),
    speaking_tutor: tutorToApi(values.speakingTutorId),
    math_tutor: tutorToApi(values.mathTutorId),
    listening_program: programToApi(values.listeningProgramId),
    reading_program: programToApi(values.readingProgramId),
    writing_program: programToApi(values.writingProgramId),
    speaking_program: programToApi(values.speakingProgramId),
    math_program: programToApi(values.mathProgramId),
    listening_note: values.listeningNote.trim(),
    reading_note: values.readingNote.trim(),
    writing_note: values.writingNote.trim(),
    speaking_note: values.speakingNote.trim(),
    math_note: values.mathNote.trim(),
    listening_sessions: countToApi(values.listeningSessions),
    reading_sessions: countToApi(values.readingSessions),
    writing_sessions: countToApi(values.writingSessions),
    speaking_sessions: countToApi(values.speakingSessions),
    math_sessions: countToApi(values.mathSessions),
    general_english_unit_1: values.generalEnglishUnit1.trim(),
    general_english_unit_1_sessions: countToApi(values.generalEnglishUnit1Sessions),
    general_english_unit_1_tutor: tutorToApi(values.generalEnglishUnit1TutorId),
    general_english_unit_1_program: programToApi(values.generalEnglishUnit1ProgramId),
    general_english_unit_1_note: values.generalEnglishUnit1Note.trim(),
    general_english_unit_2: values.generalEnglishUnit2.trim(),
    general_english_unit_2_sessions: countToApi(values.generalEnglishUnit2Sessions),
    general_english_unit_2_tutor: tutorToApi(values.generalEnglishUnit2TutorId),
    general_english_unit_2_program: programToApi(values.generalEnglishUnit2ProgramId),
    general_english_unit_2_note: values.generalEnglishUnit2Note.trim(),
    general_english_grammar_sessions: countToApi(values.generalEnglishGrammarSessions),
    general_english_grammar_tutor: tutorToApi(values.generalEnglishGrammarTutorId),
    general_english_grammar_program: programToApi(
      values.generalEnglishGrammarProgramId,
    ),
    general_english_grammar_note: values.generalEnglishGrammarNote.trim(),
    computer_science_programs: values.computerSciencePrograms
      .filter((line) => line.programId.trim())
      .map((line, index) => ({
        program: Number(line.programId),
        sessions: countToApi(line.sessions),
        tutor: tutorToApi(line.tutorId),
        note: line.note.trim(),
        position: index + 1,
      })),
  }
}

export async function fetchTutorAllocations(): Promise<TutorAllocationListResponse> {
  const { items, total } = await fetchAllPages<TutorAllocationDto>({
    client: httpClient,
    path: adminPath('/tutor-allocations'),
  })
  return {
    data: items.map(mapAllocation),
    meta: { total },
  }
}

export async function fetchTutorAllocation(
  id: string,
): Promise<TutorAllocationListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<TutorAllocationDto>>(
    adminPath(`/tutor-allocations/${id}`),
  )
  return mapAllocation(data.data)
}

export async function createTutorAllocation(values: TutorAllocationFormValues) {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TutorAllocationDto>>(
    adminPath('/tutor-allocations'),
    toWritePayload(values),
  )
  return mapAllocation(data.data)
}

export async function updateTutorAllocation(
  id: string,
  values: TutorAllocationFormValues,
) {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<TutorAllocationDto>
  >(adminPath(`/tutor-allocations/${id}`), toWritePayload(values))
  return mapAllocation(data.data)
}

export async function deleteTutorAllocation(id: string) {
  await httpClient.delete(adminPath(`/tutor-allocations/${id}`))
}

export async function approveTutorAllocation(id: string) {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TutorAllocationDto>>(
    adminPath(`/tutor-allocations/${id}/approve`),
  )
  return mapAllocation(data.data)
}

export async function assignTutorAllocationPrograms(id: string) {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TutorAllocationDto>>(
    adminPath(`/tutor-allocations/${id}/assign-programs`),
  )
  return mapAllocation(data.data)
}

function countToForm(value: number) {
  return value > 0 ? String(value) : ''
}

export function tutorAllocationToFormValues(
  allocation: TutorAllocationListItem,
): TutorAllocationFormValues {
  const studentIds: [string, string, string, string] = ['', '', '', '']
  allocation.members.forEach((member, index) => {
    if (index < 4) {
      studentIds[index] = member.studentId
    }
  })
  const sessionsPerWeek = allocation.sessionsPerWeek
  return {
    classType: allocation.classType,
    groupSize:
      allocation.groupSize === 4
        ? '4'
        : allocation.groupSize === 3
          ? '3'
          : '2',
    program: allocation.program,
    studentIds,
    sessionsPerWeek:
      sessionsPerWeek === '1' ||
      sessionsPerWeek === '2' ||
      sessionsPerWeek === '3' ||
      sessionsPerWeek === '4_6'
        ? sessionsPerWeek
        : '',
    availability: allocation.availability,
    scheduleNote: allocation.scheduleNote,
    listeningTutorId: allocation.listeningTutorId,
    readingTutorId: allocation.readingTutorId,
    writingTutorId: allocation.writingTutorId,
    speakingTutorId: allocation.speakingTutorId,
    mathTutorId: allocation.mathTutorId,
    listeningProgramId: allocation.listeningProgramId,
    readingProgramId: allocation.readingProgramId,
    writingProgramId: allocation.writingProgramId,
    speakingProgramId: allocation.speakingProgramId,
    mathProgramId: allocation.mathProgramId,
    listeningNote: allocation.listeningNote,
    readingNote: allocation.readingNote,
    writingNote: allocation.writingNote,
    speakingNote: allocation.speakingNote,
    mathNote: allocation.mathNote,
    listeningSessions: countToForm(allocation.listeningSessions),
    readingSessions: countToForm(allocation.readingSessions),
    writingSessions: countToForm(allocation.writingSessions),
    speakingSessions: countToForm(allocation.speakingSessions),
    mathSessions: countToForm(allocation.mathSessions),
    generalEnglishUnit1: allocation.generalEnglishUnit1,
    generalEnglishUnit1Sessions: countToForm(allocation.generalEnglishUnit1Sessions),
    generalEnglishUnit1TutorId: allocation.generalEnglishUnit1TutorId,
    generalEnglishUnit1ProgramId: allocation.generalEnglishUnit1ProgramId,
    generalEnglishUnit1Note: allocation.generalEnglishUnit1Note,
    generalEnglishUnit2: allocation.generalEnglishUnit2,
    generalEnglishUnit2Sessions: countToForm(allocation.generalEnglishUnit2Sessions),
    generalEnglishUnit2TutorId: allocation.generalEnglishUnit2TutorId,
    generalEnglishUnit2ProgramId: allocation.generalEnglishUnit2ProgramId,
    generalEnglishUnit2Note: allocation.generalEnglishUnit2Note,
    generalEnglishGrammarSessions: countToForm(
      allocation.generalEnglishGrammarSessions,
    ),
    generalEnglishGrammarTutorId: allocation.generalEnglishGrammarTutorId,
    generalEnglishGrammarProgramId: allocation.generalEnglishGrammarProgramId,
    generalEnglishGrammarNote: allocation.generalEnglishGrammarNote,
    computerSciencePrograms:
      allocation.computerSciencePrograms.length > 0
        ? allocation.computerSciencePrograms.map((line) => ({
            programId: line.programId,
            sessions: countToForm(line.sessions),
            tutorId: line.tutorId,
            note: line.note,
          }))
        : [{ programId: '', sessions: '', tutorId: '', note: '' }],
  }
}

type EligibleStudentDto = {
  id: number
  pin: string
  full_name: string
  mobile_phone: string
  grn: string
  prospective_student_id: number | null
  prediction_test_id: number | null
  course: string | null
  listening: string | null
  reading: string | null
  writing: string | null
  speaking: string | null
  math: string | null
  written_test_score: string | null
}

function mapEligibleStudent(dto: EligibleStudentDto): EligibleAllocationStudent {
  return {
    id: String(dto.id),
    pin: dto.pin ?? '',
    fullName: dto.full_name,
    mobilePhone: dto.mobile_phone ?? '',
    grn: dto.grn ?? '',
    prospectiveStudentId:
      dto.prospective_student_id == null
        ? null
        : String(dto.prospective_student_id),
    predictionTestId:
      dto.prediction_test_id == null ? null : String(dto.prediction_test_id),
    course: dto.course,
    listening: dto.listening,
    reading: dto.reading,
    writing: dto.writing,
    speaking: dto.speaking,
    math: dto.math,
    writtenTestScore: dto.written_test_score,
  }
}

export async function fetchEligibleStudents(
  program: string,
): Promise<EligibleAllocationStudent[]> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<EligibleStudentDto[]>
  >(adminPath('/tutor-allocations/eligible-students'), {
    params: { program },
  })
  return (data.data ?? []).map(mapEligibleStudent)
}

export const emptyTutorAllocationFormValues: TutorAllocationFormValues = {
  classType: 'private',
  groupSize: '2',
  program: '',
  studentIds: ['', '', '', ''],
  sessionsPerWeek: '',
  availability: emptyScheduleAvailability(),
  scheduleNote: '',
  listeningTutorId: '',
  readingTutorId: '',
  writingTutorId: '',
  speakingTutorId: '',
  mathTutorId: '',
  listeningProgramId: '',
  readingProgramId: '',
  writingProgramId: '',
  speakingProgramId: '',
  mathProgramId: '',
  listeningNote: '',
  readingNote: '',
  writingNote: '',
  speakingNote: '',
  mathNote: '',
  listeningSessions: '',
  readingSessions: '',
  writingSessions: '',
  speakingSessions: '',
  mathSessions: '',
  generalEnglishUnit1: '',
  generalEnglishUnit1Sessions: '',
  generalEnglishUnit1TutorId: '',
  generalEnglishUnit1ProgramId: '',
  generalEnglishUnit1Note: '',
  generalEnglishUnit2: '',
  generalEnglishUnit2Sessions: '',
  generalEnglishUnit2TutorId: '',
  generalEnglishUnit2ProgramId: '',
  generalEnglishUnit2Note: '',
  generalEnglishGrammarSessions: '',
  generalEnglishGrammarTutorId: '',
  generalEnglishGrammarProgramId: '',
  generalEnglishGrammarNote: '',
  computerSciencePrograms: [{ programId: '', sessions: '', tutorId: '', note: '' }],
}
