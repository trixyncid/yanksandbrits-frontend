export const GENERAL_ENGLISH_WRITING_LEVELS = [
  {
    code: 'A1',
    label: 'A1 (Starter)',
    criteria: [
      {
        key: 'a1IsolatedInformation',
        apiKey: 'a1_isolated_information',
        label: 'Provides very simple isolated information',
      },
      {
        key: 'a1MinimalVocabulary',
        apiKey: 'a1_minimal_vocabulary',
        label: 'Uses minimal vocabulary, often resorting to native language.',
      },
      {
        key: 'a1Grammar',
        apiKey: 'a1_grammar',
        label: 'Shows minimal control of grammar with frequent errors.',
      },
    ],
  },
  {
    code: 'A2',
    label: 'A2 (Elementary)',
    criteria: [
      {
        key: 'a2BasicConnections',
        apiKey: 'a2_basic_connections',
        label: 'Provides simple information with basic connections',
      },
      {
        key: 'a2LimitedVocabulary',
        apiKey: 'a2_limited_vocabulary',
        label:
          'Uses limited vocabulary with basic connectors like "and", "but", and "because"',
      },
      {
        key: 'a2Grammar',
        apiKey: 'a2_grammar',
        label: 'Demonstrates basic grammar with significant errors.',
      },
    ],
  },
  {
    code: 'B1',
    label: 'B1 (Pre-Intermediate)',
    criteria: [
      {
        key: 'b1Description',
        apiKey: 'b1_description',
        label:
          'Provides straightforward description with connections between ideas.',
      },
      {
        key: 'b1Vocabulary',
        apiKey: 'b1_vocabulary',
        label: 'Basic vocabulary used appropriately.',
      },
      {
        key: 'b1Grammar',
        apiKey: 'b1_grammar',
        label:
          'Has basic command of grammar with some repetition in sentence structures.',
      },
    ],
  },
  {
    code: 'B2',
    label: 'B2 (Intermediate)',
    criteria: [
      {
        key: 'b2DetailedDescription',
        apiKey: 'b2_detailed_description',
        label:
          'Provides clear and detailed description, synthesizing and evaluating information effectively.',
      },
      {
        key: 'b2Vocabulary',
        apiKey: 'b2_vocabulary',
        label: 'Demonstrates a good range of vocabulary with some precision.',
      },
      {
        key: 'b2Grammar',
        apiKey: 'b2_grammar',
        label: 'Displays good control of grammar with noticeable errors.',
      },
    ],
  },
  {
    code: 'C1',
    label: 'C1 (Upper-Intermediate)',
    criteria: [
      {
        key: 'c1StructuredDescription',
        apiKey: 'c1_structured_description',
        label: 'Provides clear, well-structured description and explanation.',
      },
      {
        key: 'c1Vocabulary',
        apiKey: 'c1_vocabulary',
        label: 'Uses advanced vocabulary effectively to convey meaning.',
      },
      {
        key: 'c1Grammar',
        apiKey: 'c1_grammar',
        label: 'Shows very good control of grammar with occasional minor errors.',
      },
    ],
  },
  {
    code: 'C2',
    label: 'C2 (Advanced)',
    criteria: [
      {
        key: 'c2SophisticatedDescription',
        apiKey: 'c2_sophisticated_description',
        label: 'Provides sophisticated description and explanation.',
      },
      {
        key: 'c2Vocabulary',
        apiKey: 'c2_vocabulary',
        label: 'Uses an extensive vocabulary accurately and appropriately.',
      },
      {
        key: 'c2Grammar',
        apiKey: 'c2_grammar',
        label: 'Demonstrates excellent control of grammar with near-perfect accuracy.',
      },
    ],
  },
] as const

export type GeneralEnglishWritingKey =
  (typeof GENERAL_ENGLISH_WRITING_LEVELS)[number]['criteria'][number]['key']

export const GENERAL_ENGLISH_WRITING_COMMENT_MAX_LENGTH = 255

export type GeneralEnglishWritingCriterion = {
  checked: boolean
  comment: string
}

export type GeneralEnglishWritingChecks = {
  notes: string
  criteria: Record<GeneralEnglishWritingKey, GeneralEnglishWritingCriterion>
}

export function emptyGeneralEnglishWriting(): GeneralEnglishWritingChecks {
  const criteria = {} as GeneralEnglishWritingChecks['criteria']
  for (const level of GENERAL_ENGLISH_WRITING_LEVELS) {
    for (const criterion of level.criteria) {
      criteria[criterion.key] = { checked: false, comment: '' }
    }
  }
  return { notes: '', criteria }
}

export function generalEnglishWritingFromApi(
  dto: Record<string, boolean | string | null | undefined> | null | undefined,
): GeneralEnglishWritingChecks {
  const writing = emptyGeneralEnglishWriting()
  if (!dto) {
    return writing
  }
  writing.notes = typeof dto.notes === 'string' ? dto.notes : ''
  for (const level of GENERAL_ENGLISH_WRITING_LEVELS) {
    for (const criterion of level.criteria) {
      const comment = dto[`${criterion.apiKey}_comment`]
      writing.criteria[criterion.key] = {
        checked: Boolean(dto[criterion.apiKey]),
        comment: typeof comment === 'string' ? comment : '',
      }
    }
  }
  return writing
}

export function generalEnglishWritingToApi(
  writing: GeneralEnglishWritingChecks,
): Record<string, boolean | string> {
  const payload: Record<string, boolean | string> = {
    notes: writing.notes.trim(),
  }
  for (const level of GENERAL_ENGLISH_WRITING_LEVELS) {
    for (const criterion of level.criteria) {
      const value = writing.criteria[criterion.key]
      payload[criterion.apiKey] = Boolean(value?.checked)
      payload[`${criterion.apiKey}_comment`] = (value?.comment ?? '').trim()
    }
  }
  return payload
}

export function generalEnglishWritingLevelCounts(
  writing: GeneralEnglishWritingChecks,
) {
  return GENERAL_ENGLISH_WRITING_LEVELS.map((level) => ({
    code: level.code,
    checked: level.criteria.filter(
      (criterion) => writing.criteria[criterion.key]?.checked,
    ).length,
    total: level.criteria.length,
  }))
}
