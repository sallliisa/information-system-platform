import { describe, expect, it } from 'vitest'
import { compileMobileRouteCatalog } from '../catalog.compiler'
import { buildMenuGroups, filterMenuEntries, formatGroupTitle } from '../menu.selectors'

const catalog = compileMobileRouteCatalog({
  modules: [
    {
      path: './settings/settings.module.ts',
      meta: { name: 'settings', order: 1, models: ['users', 'roles'] },
    },
  ],
  models: [
    {
      path: './settings/users/users.model.tsx',
      config: { name: 'users', title: 'Users', description: 'Manage app users' },
    },
    {
      path: './settings/roles/roles.model.tsx',
      config: { name: 'roles', title: 'Roles', description: 'Role management' },
    },
  ],
})

describe('menu selectors', () => {
  it('filters entries with title and description query', () => {
    expect(filterMenuEntries(catalog.entries, 'users').map((entry) => entry.key)).toEqual(['settings/users'])
    expect(filterMenuEntries(catalog.entries, 'role management').map((entry) => entry.key)).toEqual(['settings/roles'])
  })

  it('groups filtered entries by module metadata order', () => {
    const filtered = filterMenuEntries(catalog.entries, 'roles')
    const groups = buildMenuGroups(catalog, filtered)

    expect(groups).toHaveLength(1)
    expect(groups[0].moduleSlug).toBe('settings')
    expect(groups[0].entries.map((entry) => entry.key)).toEqual(['settings/roles'])
  })

  it('formats module group titles', () => {
    expect(formatGroupTitle('settings_management')).toBe('Settings Management')
  })
})
