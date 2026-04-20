import type { FormField } from '@/types/form'

export type ValidationPreset = 'required' | 'email' | 'phone'

export type ValidationContext = {
  field: string
  formData: Record<string, any>
  inputConfig: FormField
}

export type ValidationFn = (value: any, ctx: ValidationContext) => true | string

export type ValidationRule = ValidationPreset | ValidationFn | { rule: ValidationPreset | ValidationFn; message?: string }

type PresetExecutor = (value: any) => boolean

export type NormalizedValidationRule = {
  preset?: ValidationPreset
  message?: string
  executor: ValidationFn
}

const PRESET_MESSAGES: Record<ValidationPreset, string> = {
  required: 'Harus diisi!',
  email: 'Format email tidak valid!',
  phone: 'Format nomor telepon tidak valid!',
}

const PRESET_EXECUTORS: Record<ValidationPreset, PresetExecutor> = {
  required: (value) => !isEmptyValue(value),
  email: (value) => {
    if (isEmptyValue(value)) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
  },
  phone: (value) => {
    if (isEmptyValue(value)) return true
    return /^(\+?\d{1,3}[-.\s]?)?(\(?\d+\)?[-.\s]?){2,}$/.test(String(value))
  },
}

export function isEmptyValue(value: any) {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

function normalizeRule(rule: ValidationRule): NormalizedValidationRule | null {
  if (typeof rule === 'string') {
    const preset = rule
    return {
      preset,
      message: PRESET_MESSAGES[preset],
      executor: (value) => (PRESET_EXECUTORS[preset](value) ? true : PRESET_MESSAGES[preset]),
    }
  }

  if (typeof rule === 'function') {
    return {
      executor: rule,
    }
  }

  if (rule && typeof rule === 'object' && 'rule' in rule) {
    const base = normalizeRule(rule.rule as ValidationRule)
    if (!base) return null
    const customMessage = rule.message
    if (!customMessage) return base

    return {
      ...base,
      message: customMessage,
      executor: (value, ctx) => {
        const result = base.executor(value, ctx)
        return result === true ? true : customMessage
      },
    }
  }

  return null
}

export function normalizeValidationRules(rules?: ValidationRule[] | null): NormalizedValidationRule[] {
  if (!Array.isArray(rules)) return []
  return rules.map((rule) => normalizeRule(rule)).filter((rule): rule is NormalizedValidationRule => Boolean(rule))
}

export function executeValidationRules(value: any, ctx: ValidationContext, rules?: ValidationRule[] | null): string {
  const normalizedRules = normalizeValidationRules(rules)
  for (const rule of normalizedRules) {
    const result = rule.executor(value, ctx)
    if (result !== true) return result
  }
  return ''
}

export function hasRequiredValidation(rules?: ValidationRule[] | null) {
  return normalizeValidationRules(rules).some((rule) => rule.preset === 'required')
}
