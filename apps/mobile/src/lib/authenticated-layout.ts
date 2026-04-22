export const AUTHENTICATED_NAVBAR_HEIGHT = 60
export const AUTHENTICATED_NAVBAR_BOTTOM_PADDING = 16
export const AUTHENTICATED_NAVBAR_HORIZONTAL_PADDING = 24
export const AUTHENTICATED_NAVBAR_MAX_SAFE_AREA_INSET = 16
export const AUTHENTICATED_CONTENT_BREATHING_ROOM = 6

export function normalizeAuthenticatedInset(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

export function resolveAuthenticatedNavbarBottomPadding(insetBottom: number): number {
  const normalizedInsetBottom = normalizeAuthenticatedInset(insetBottom)
  const resolvedSafeAreaInset = Math.min(normalizedInsetBottom, AUTHENTICATED_NAVBAR_MAX_SAFE_AREA_INSET)
  return resolvedSafeAreaInset + AUTHENTICATED_NAVBAR_BOTTOM_PADDING
}

export function getAuthenticatedContentBottomInset(insetBottom: number): number {
  return (
    AUTHENTICATED_NAVBAR_HEIGHT +
    resolveAuthenticatedNavbarBottomPadding(insetBottom) +
    AUTHENTICATED_CONTENT_BREATHING_ROOM
  )
}
