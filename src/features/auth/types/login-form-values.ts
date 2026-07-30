export type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>
