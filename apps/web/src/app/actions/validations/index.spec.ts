import { describe, expect, it } from 'vitest'
import { executeValidationRules, normalizeValidationRules, type ValidationRule } from './index'

const baseCtx = {
  field: 'email',
  formData: { email: '' },
  inputConfig: { type: 'text', props: {} } as any,
}

describe('validations runtime', () => {
  it('normalizes preset and function rules', () => {
    const fn: ValidationRule = (value) => (value ? true : 'custom')
    const rules = normalizeValidationRules(['required', fn])

    expect(rules).toHaveLength(2)
    expect(rules[0]?.preset).toBe('required')
    expect(typeof rules[1]?.executor).toBe('function')
  })

  it('runs required preset', () => {
    expect(executeValidationRules('', baseCtx, ['required'])).toBe('Harus diisi!')
    expect(executeValidationRules('ok', baseCtx, ['required'])).toBe('')
  })

  it('runs email preset', () => {
    expect(executeValidationRules('not-an-email', baseCtx, ['email'])).toBe('Format email tidak valid!')
    expect(executeValidationRules('user@mail.com', baseCtx, ['email'])).toBe('')
  })

  it('runs phone preset', () => {
    expect(executeValidationRules('abc', baseCtx, ['phone'])).toBe('Format nomor telepon tidak valid!')
    expect(executeValidationRules('+62 811 1234 5678', baseCtx, ['phone'])).toBe('')
  })

  it('supports custom fn and object message override', () => {
    const custom = (value: string) => (value === 'ok' ? true : 'Not OK')
    expect(executeValidationRules('bad', baseCtx, [custom])).toBe('Not OK')

    const overridden = [{ rule: 'required' as const, message: 'Wajib diisi' }]
    expect(executeValidationRules('', baseCtx, overridden)).toBe('Wajib diisi')
  })
})
