import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Apostle } from '@southneuhof/apostle'
import { FrameworkService } from '../FrameworkService'
import frameworkServices, { configureFrameworkService, resetFrameworkServiceForTests } from '../index'

describe('frameworkServices singleton', () => {
  beforeEach(() => {
    resetFrameworkServiceForTests()
  })

  it('throws when used before configuration', async () => {
    await expect(frameworkServices.get('users')).rejects.toThrow('not configured')
  })

  it('configures from FrameworkServiceOptions', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    configureFrameworkService({
      baseURL: 'https://api.test/',
      apostle: new Apostle({
        baseURL: 'https://api.test/',
        fetchImpl,
        config: { inferResponseBodyContentType: true, defaultResponseType: 'json' },
      }),
    })

    await frameworkServices.list('users')
    expect(fetchImpl).toHaveBeenCalled()
    const firstUrl = String((fetchImpl as any).mock.calls[0][0])
    expect(firstUrl).toContain('users/list')
  })

  it('configures from concrete service instance', async () => {
    const mock = { get: vi.fn(async () => ({ ok: true })), post: vi.fn(async () => ({ ok: true })) }
    configureFrameworkService(mock as any)
    await frameworkServices.get('x')
    expect(mock.get).toHaveBeenCalledWith('x')
  })

  it('reconfiguration replaces previous instance', async () => {
    const first = { get: vi.fn(async () => 1), post: vi.fn(async () => 1) }
    const second = { get: vi.fn(async () => 2), post: vi.fn(async () => 2) }
    configureFrameworkService(first as any)
    configureFrameworkService(second as any)
    await frameworkServices.get('x')
    expect(first.get).not.toHaveBeenCalled()
    expect(second.get).toHaveBeenCalledWith('x')
  })

  it('configureFrameworkService returns configured instance', () => {
    const service = new FrameworkService({ baseURL: 'https://api.test/' })
    const configured = configureFrameworkService(service as any)
    expect(configured).toBe(service)
  })
})
