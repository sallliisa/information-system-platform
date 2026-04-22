import { describe, expect, it } from 'vitest'
import { LEGACY_SETTINGS_REDIRECTS, resolveLegacySettingsRedirect } from '../legacy-redirects'

describe('legacy settings redirects', () => {
  it('maps legacy settings routes to canonical list routes', () => {
    expect(LEGACY_SETTINGS_REDIRECTS['/settings/users']).toBe('/settings/users/list')
    expect(LEGACY_SETTINGS_REDIRECTS['/settings/roles']).toBe('/settings/roles/list')
    expect(LEGACY_SETTINGS_REDIRECTS['/settings/tasks']).toBe('/settings/tasks/list')
  })

  it('returns null for unknown paths', () => {
    expect(resolveLegacySettingsRedirect('/settings/unknown')).toBeNull()
  })
})
