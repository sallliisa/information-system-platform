import { describe, expect, it, vi } from 'vitest'
import { isActivePath, navigateAsSwitch, navigateBackOrFallback } from '../navigation.policy'

describe('navigation policy', () => {
  it('normalizes path equality for switch navigation', () => {
    expect(isActivePath('/(authenticated)/menu', '/menu')).toBe(true)
    expect(isActivePath('/menu/', '/menu')).toBe(true)
    expect(isActivePath('/profile', '/menu')).toBe(false)
  })

  it('replaces only when switching to a different route', () => {
    const router = {
      back: vi.fn(),
      replace: vi.fn(),
    }

    expect(navigateAsSwitch(router, '/menu', '/menu')).toBe(false)
    expect(router.replace).not.toHaveBeenCalled()

    expect(navigateAsSwitch(router, '/menu', '/profile')).toBe(true)
    expect(router.replace).toHaveBeenCalledWith('/profile')
  })

  it('backs when possible and falls back to replace', () => {
    const backRouter = {
      back: vi.fn(),
      replace: vi.fn(),
      canGoBack: vi.fn(() => true),
    }
    const fallbackRouter = {
      back: vi.fn(),
      replace: vi.fn(),
      canGoBack: vi.fn(() => false),
    }

    expect(navigateBackOrFallback(backRouter, '/menu')).toBe('back')
    expect(backRouter.back).toHaveBeenCalledTimes(1)
    expect(backRouter.replace).not.toHaveBeenCalled()

    expect(navigateBackOrFallback(fallbackRouter, '/menu')).toBe('fallback')
    expect(fallbackRouter.replace).toHaveBeenCalledWith('/menu')
    expect(fallbackRouter.back).not.toHaveBeenCalled()
  })
})
