export const GENERAL_ENGLISH_SPEAKING_LEVELS = [
  {
    code: 'A1',
    label: 'A1 (Starter)',
    criteria: [
      {
        key: 'a1SimpleAnswers',
        apiKey: 'a1_simple_answers',
        label:
          'Responds to basic questions with simple answers, sometimes pausing awkwardly',
      },
      {
        key: 'a1BasicVocabulary',
        apiKey: 'a1_basic_vocabulary',
        label:
          'Uses very basic vocabulary: sometimes uses their native language instead of English',
      },
      {
        key: 'a1WordForms',
        apiKey: 'a1_word_forms',
        label: 'Recognizes word forms without sentence construction.',
      },
      {
        key: 'a1Pronunciation',
        apiKey: 'a1_pronunciation',
        label:
          'Pronunciation may be unclear but is generally understandable with effort.',
      },
    ],
  },
  {
    code: 'A2',
    label: 'A2 (Elementary)',
    criteria: [
      {
        key: 'a2ShortAnswers',
        apiKey: 'a2_short_answers',
        label: 'Can respond to questions with short, simple answers.',
      },
      {
        key: 'a2Vocabulary',
        apiKey: 'a2_vocabulary',
        label: 'Uses sufficient vocabulary to keep up with the topic given.',
      },
      {
        key: 'a2Sentences',
        apiKey: 'a2_sentences',
        label:
          'Uses simple with some complex sentences to describe experiences and events.',
      },
      {
        key: 'a2Pronunciation',
        apiKey: 'a2_pronunciation',
        label:
          'Pronunciation is understandable, though there may be severe pronunciation deficiencies',
      },
    ],
  },
  {
    code: 'B1',
    label: 'B1 (Pre-Intermediate)',
    criteria: [
      {
        key: 'b1Conversation',
        apiKey: 'b1_conversation',
        label: 'Can maintain a conversation on familiar topics only.',
      },
      {
        key: 'b1Vocabulary',
        apiKey: 'b1_vocabulary',
        label: 'Uses sufficient vocabulary to keep up with the topic given.',
      },
      {
        key: 'b1Sentences',
        apiKey: 'b1_sentences',
        label:
          'Uses simple with some complex sentences to describe experiences and events.',
      },
      {
        key: 'b1Pronunciation',
        apiKey: 'b1_pronunciation',
        label: 'Pronunciation is generally clear with noticeable errors.',
      },
    ],
  },
  {
    code: 'B2',
    label: 'B2 (Intermediate)',
    criteria: [
      {
        key: 'b2ExtendedResponses',
        apiKey: 'b2_extended_responses',
        label: 'Is able to give responses with more than one sentence',
      },
      {
        key: 'b2AdvancedVocabulary',
        apiKey: 'b2_advanced_vocabulary',
        label: 'Attempts to use advanced vocabulary with limited success',
      },
      {
        key: 'b2Control',
        apiKey: 'b2_control',
        label: 'Reasonable control: some errors but comprehensible',
      },
      {
        key: 'b2Pronunciation',
        apiKey: 'b2_pronunciation',
        label:
          'Has clear and understandable pronunciation, albeit with limited features.',
      },
    ],
  },
  {
    code: 'C1',
    label: 'C1 (Upper-Intermediate)',
    criteria: [
      {
        key: 'c1Elaboration',
        apiKey: 'c1_elaboration',
        label: 'Uses extended responses and elaborates on points.',
      },
      {
        key: 'c1Vocabulary',
        apiKey: 'c1_vocabulary',
        label: 'Has a wide range of vocabulary and can express nuanced ideas.',
      },
      {
        key: 'c1Control',
        apiKey: 'c1_control',
        label: 'Very good control: errors are rare and minor.',
      },
      {
        key: 'c1Pronunciation',
        apiKey: 'c1_pronunciation',
        label: 'Pronunciation is clear with minor, infrequent errors.',
      },
    ],
  },
  {
    code: 'C2',
    label: 'C2 (Advanced)',
    criteria: [
      {
        key: 'c2Fluency',
        apiKey: 'c2_fluency',
        label:
          'Provides detailed and fluent responses with complex sentence structures.',
      },
      {
        key: 'c2Vocabulary',
        apiKey: 'c2_vocabulary',
        label: 'Uses an extensive vocabulary accurately and appropriately.',
      },
      {
        key: 'c2Accuracy',
        apiKey: 'c2_accuracy',
        label: 'Excellent control with near-perfect accuracy.',
      },
      {
        key: 'c2Pronunciation',
        apiKey: 'c2_pronunciation',
        label: 'Pronunciation is almost always clear and precise.',
      },
    ],
  },
] as const

export type GeneralEnglishSpeakingKey =
  (typeof GENERAL_ENGLISH_SPEAKING_LEVELS)[number]['criteria'][number]['key']

export const GENERAL_ENGLISH_SPEAKING_COMMENT_MAX_LENGTH = 255

export type GeneralEnglishSpeakingCriterion = {
  checked: boolean
  comment: string
}

export type GeneralEnglishSpeakingChecks = {
  notes: string
  criteria: Record<GeneralEnglishSpeakingKey, GeneralEnglishSpeakingCriterion>
}

export function emptyGeneralEnglishSpeaking(): GeneralEnglishSpeakingChecks {
  const criteria = {} as GeneralEnglishSpeakingChecks['criteria']
  for (const level of GENERAL_ENGLISH_SPEAKING_LEVELS) {
    for (const criterion of level.criteria) {
      criteria[criterion.key] = { checked: false, comment: '' }
    }
  }
  return { notes: '', criteria }
}

export function generalEnglishSpeakingFromApi(
  dto: Record<string, boolean | string | null | undefined> | null | undefined,
): GeneralEnglishSpeakingChecks {
  const speaking = emptyGeneralEnglishSpeaking()
  if (!dto) {
    return speaking
  }
  speaking.notes = typeof dto.notes === 'string' ? dto.notes : ''
  for (const level of GENERAL_ENGLISH_SPEAKING_LEVELS) {
    for (const criterion of level.criteria) {
      const comment = dto[`${criterion.apiKey}_comment`]
      speaking.criteria[criterion.key] = {
        checked: Boolean(dto[criterion.apiKey]),
        comment: typeof comment === 'string' ? comment : '',
      }
    }
  }
  return speaking
}

export function generalEnglishSpeakingToApi(
  speaking: GeneralEnglishSpeakingChecks,
): Record<string, boolean | string> {
  const payload: Record<string, boolean | string> = {
    notes: speaking.notes.trim(),
  }
  for (const level of GENERAL_ENGLISH_SPEAKING_LEVELS) {
    for (const criterion of level.criteria) {
      const value = speaking.criteria[criterion.key]
      payload[criterion.apiKey] = Boolean(value?.checked)
      payload[`${criterion.apiKey}_comment`] = (value?.comment ?? '').trim()
    }
  }
  return payload
}

export function generalEnglishSpeakingLevelCounts(
  speaking: GeneralEnglishSpeakingChecks,
) {
  return GENERAL_ENGLISH_SPEAKING_LEVELS.map((level) => ({
    code: level.code,
    checked: level.criteria.filter(
      (criterion) => speaking.criteria[criterion.key]?.checked,
    ).length,
    total: level.criteria.length,
  }))
}
