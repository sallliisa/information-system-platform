import type { InputConfig } from '@southneuhof/is-data-model'
import { createContext, useContext } from 'react'

export type FormValidationContextValue = {
  formData: Record<string, any>
  fieldErrors: Record<string, string>
  fieldTouched: Record<string, boolean>
  submitAttempted: boolean
  inputConfig: InputConfig
  validateField: (field: string, sourceData?: Record<string, any>) => string
  validateVisibleFields: () => boolean
  clearFieldValidation: (field: string) => void
  touchField: (field: string) => void
}

export const FormValidationContext = createContext<FormValidationContextValue | null>(null)

export function useFormValidationContext() {
  return useContext(FormValidationContext)
}
