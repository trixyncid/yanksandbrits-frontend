export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
  meta: Record<string, unknown> | null
}

export type ApiErrorBody = {
  code: string
  message: string
  details: unknown
}
