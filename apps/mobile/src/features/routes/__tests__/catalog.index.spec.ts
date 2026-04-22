import { describe, expect, it } from 'vitest'
import { compileMobileRouteCatalog } from '../catalog.compiler'
import {
  buildDetailHref,
  buildModuleModelKey,
  buildUpdateHref,
  getCatalogEntry,
  selectCatalogMenuEntries,
  selectDefaultPrivateRouteHref,
} from '../catalog.index'

const catalog = compileMobileRouteCatalog({
  modules: [
    {
      path: './settings/settings.module.ts',
      meta: {
        name: 'Settings',
        order: 1,
        models: ['users', 'roles', 'tasks'],
      },
    },
  ],
  models: [
    {
      path: './settings/users/users.model.tsx',
      config: { name: 'users', title: 'Users', permission: 'users' },
    },
    {
      path: './settings/roles/roles.model.tsx',
      config: { name: 'roles', title: 'Roles', permission: 'roles' },
    },
    {
      path: './settings/tasks/tasks.model.tsx',
      config: { name: 'tasks', title: 'Tasks', permission: 'tasks' },
    },
  ],
})

describe('catalog index helpers', () => {
  it('resolves CRUD routes from module and model slug', () => {
    const key = buildModuleModelKey('settings', 'users')
    const entry = catalog.byModuleModel.get(key)

    expect(entry?.hrefs.list).toBe('/settings/users/list')
    expect(entry?.hrefs.create).toBe('/settings/users/create')
    expect(buildDetailHref(entry!, 123)).toBe('/settings/users/detail/123')
    expect(buildUpdateHref(entry!, 123)).toBe('/settings/users/update/123')
    expect(getCatalogEntry(catalog, 'settings', 'missing')).toBeUndefined()
  })

  it('filters menu entries by permission payload', () => {
    const entries = selectCatalogMenuEntries(catalog, ['view-roles'])
    expect(entries.map((entry) => entry.key)).toEqual(['settings/roles'])
  })

  it('falls back when no accessible default route exists', () => {
    expect(selectDefaultPrivateRouteHref(catalog, ['view-nothing'], '/menu')).toBe('/menu')
  })
})
