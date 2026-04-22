import { describe, expect, it } from 'vitest'
import {
  AUTHENTICATED_CONTENT_BREATHING_ROOM,
  AUTHENTICATED_NAVBAR_BOTTOM_PADDING,
  AUTHENTICATED_NAVBAR_HEIGHT,
  AUTHENTICATED_NAVBAR_MAX_SAFE_AREA_INSET,
  getAuthenticatedContentBottomInset,
  normalizeAuthenticatedInset,
  resolveAuthenticatedNavbarBottomPadding,
} from '../authenticated-layout'

describe('authenticated layout metrics', () => {
  it('normalizes invalid inset values to zero', () => {
    expect(normalizeAuthenticatedInset(-1)).toBe(0)
    expect(normalizeAuthenticatedInset(Number.NaN)).toBe(0)
    expect(normalizeAuthenticatedInset(12)).toBe(12)
  })

  it('clamps navbar safe-area contribution to the configured max inset', () => {
    expect(resolveAuthenticatedNavbarBottomPadding(0)).toBe(AUTHENTICATED_NAVBAR_BOTTOM_PADDING)
    expect(resolveAuthenticatedNavbarBottomPadding(8)).toBe(AUTHENTICATED_NAVBAR_BOTTOM_PADDING + 8)
    expect(resolveAuthenticatedNavbarBottomPadding(48)).toBe(
      AUTHENTICATED_NAVBAR_BOTTOM_PADDING + AUTHENTICATED_NAVBAR_MAX_SAFE_AREA_INSET
    )
  })

  it('computes content bottom inset from navbar height, navbar padding, and breathing room', () => {
    expect(getAuthenticatedContentBottomInset(8)).toBe(
      AUTHENTICATED_NAVBAR_HEIGHT +
        AUTHENTICATED_NAVBAR_BOTTOM_PADDING +
        8 +
        AUTHENTICATED_CONTENT_BREATHING_ROOM
    )
  })

  it('uses the clamped safe-area value when computing content bottom inset', () => {
    expect(getAuthenticatedContentBottomInset(999)).toBe(
      AUTHENTICATED_NAVBAR_HEIGHT +
        AUTHENTICATED_NAVBAR_BOTTOM_PADDING +
        AUTHENTICATED_NAVBAR_MAX_SAFE_AREA_INSET +
        AUTHENTICATED_CONTENT_BREATHING_ROOM
    )
  })
})
