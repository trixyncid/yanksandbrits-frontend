import { extraStudentSchema } from '../schema/prospective-student-form-schema'
import type { ExtraStudentErrors, ExtraStudentValues } from '../types/prospective-student'

let nextKey = 0

/** A blank extra student; phone and address start as the first student's. */
export function emptyExtraStudent(
  defaults: Pick<ExtraStudentValues, 'phone' | 'address'> = { phone: '', address: '' },
): ExtraStudentValues {
  nextKey += 1
  return {
    key: `extra-${nextKey}`,
    fullName: '',
    email: '',
    phone: defaults.phone,
    gender: '',
    age: '',
    course: '',
    status: 'consult',
    srNumber: '',
    address: defaults.address,
  }
}

/** Field errors for one extra student, or none when it is valid. */
export function validateExtraStudent(student: ExtraStudentValues): ExtraStudentErrors {
  const result = extraStudentSchema.safeParse(student)
  if (result.success) return {}
  const errors: ExtraStudentErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ExtraStudentValues
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}
