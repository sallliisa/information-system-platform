export const AUTHENTICATED_NAVBAR_HEIGHT = 60
export const AUTHENTICATED_NAVBAR_HORIZONTAL_PADDING = 16

const AUTHENTICATED_NAVBAR_BASE_BOTTOM_PADDING = 8
const AUTHENTICATED_NAVBAR_MAX_SAFE_AREA = 24
const AUTHENTICATED_CONTENT_BOTTOM_BREATHING_ROOM = 12

export function clampAuthenticatedSafeAreaBottom(bottomInset: number): number {
  const value = Number.isFinite(bottomInset) ? Math.max(0, bottomInset) : 0
  return Math.min(value, AUTHENTICATED_NAVBAR_MAX_SAFE_AREA)
}

export function resolveAuthenticatedNavbarBottomPadding(bottomInset: number): number {
  return AUTHENTICATED_NAVBAR_BASE_BOTTOM_PADDING + clampAuthenticatedSafeAreaBottom(bottomInset)
}

export function getAuthenticatedContentBottomInset(bottomInset: number): number {
  return AUTHENTICATED_NAVBAR_HEIGHT + resolveAuthenticatedNavbarBottomPadding(bottomInset) + AUTHENTICATED_CONTENT_BOTTOM_BREATHING_ROOM
}
