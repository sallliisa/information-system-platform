export const LEGACY_SETTINGS_REDIRECTS = {
  '/settings/users': '/settings/users/list',
  '/settings/roles': '/settings/roles/list',
  '/settings/tasks': '/settings/tasks/list',
} as const

export type LegacySettingsPath = keyof typeof LEGACY_SETTINGS_REDIRECTS

export function resolveLegacySettingsRedirect(pathname: string): string | null {
  const trimmed = String(pathname || '').trim() as LegacySettingsPath
  return LEGACY_SETTINGS_REDIRECTS[trimmed] || null
}
