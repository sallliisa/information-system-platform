import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { executeValidationRules } from './index'

const baseCtxWithoutRequired = {
  field: 'email',
  formData: { email: '' },
  inputConfig: { type: 'text', props: {} } as any,
}

const baseCtxWithRequired = {
  field: 'email',
  formData: { email: '' },
  inputConfig: { type: 'text', props: { required: true } } as any,
}

describe('validations runtime', () => {
  it('validates required and empty rules correctly', () => {
    expect(executeValidationRules('', baseCtxWithRequired, undefined)).toBe('Harus diisi!')
    expect(executeValidationRules('ok', baseCtxWithRequired, undefined)).toBe('')
    expect(executeValidationRules([], baseCtxWithRequired, undefined)).toBe('Harus diisi!')
    expect(executeValidationRules(false, baseCtxWithRequired, undefined)).toBe('')
    expect(executeValidationRules(0, baseCtxWithRequired, undefined)).toBe('')
  })

  it('skips zod validation for optional empty values', () => {
    expect(executeValidationRules('', baseCtxWithoutRequired, z.string().email())).toBe('')
  })

  it('returns custom zod message for invalid non-empty values', () => {
    expect(executeValidationRules('bad', baseCtxWithoutRequired, z.string().email('Format email tidak valid!'))).toBe('Format email tidak valid!')
    expect(executeValidationRules('user@mail.com', baseCtxWithoutRequired, z.string().email())).toBe('')
  })

  it('returns first zod issue message', () => {
    expect(executeValidationRules('bad', baseCtxWithoutRequired, z.string().min(10))).toBe('String must contain at least 10 character(s)')
  })
})
