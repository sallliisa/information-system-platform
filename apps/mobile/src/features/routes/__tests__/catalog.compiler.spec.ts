import { describe, expect, it } from 'vitest'
import { compileMobileRouteCatalog, compileMobileRouteCatalogFromContexts, type RuntimeContextModule } from '../catalog.compiler'
import settingsModule from '../settings/settings.module'
import usersModel from '../settings/users/users.model'
import rolesModel from '../settings/roles/roles.model'
import tasksModel from '../settings/tasks/tasks.model'

function createContext(definitions: Record<string, unknown>): RuntimeContextModule {
  const context = ((id: string) => definitions[id]) as RuntimeContextModule
  context.keys = () => Object.keys(definitions)
  return context
}

describe('mobile route catalog compiler', () => {
  it('discovers settings module and settings models from contexts', () => {
    const moduleContext = createContext({
      './settings/settings.module.ts': { default: settingsModule },
    })
    const modelContext = createContext({
      './settings/users/users.model.tsx': { default: usersModel },
      './settings/roles/roles.model.tsx': { default: rolesModel },
      './settings/tasks/tasks.model.tsx': { default: tasksModel },
    })

    const catalog = compileMobileRouteCatalogFromContexts(moduleContext, modelContext)
    expect(catalog.modules).toHaveLength(1)
    expect(catalog.modules[0].moduleSlug).toBe('settings')
    expect(catalog.entries.map((entry) => entry.key)).toEqual(['settings/users', 'settings/roles', 'settings/tasks'])
  })

  it('validates model filename-folder convention', () => {
    expect(() =>
      compileMobileRouteCatalog({
        modules: [{ path: './settings/settings.module.ts', meta: settingsModule }],
        models: [{ path: './settings/users/people.model.tsx', config: usersModel }],
      })
    ).toThrow(/Model file name mismatch/)
  })

  it('rejects duplicate module-model pairs', () => {
    expect(() =>
      compileMobileRouteCatalog({
        modules: [{ path: './settings/settings.module.ts', meta: settingsModule }],
        models: [
          { path: './settings/users/users.model.tsx', config: usersModel },
          { path: './settings/users/users.model.tsx', config: usersModel },
        ],
      })
    ).toThrow(/Duplicate model definition/)
  })

  it('rejects model definitions without module definition', () => {
    expect(() =>
      compileMobileRouteCatalog({
        modules: [],
        models: [{ path: './settings/users/users.model.tsx', config: usersModel }],
      })
    ).toThrow(/Missing settings\.module\.ts/)
  })

  it('rejects config.name mismatch against folder slug', () => {
    expect(() =>
      compileMobileRouteCatalog({
        modules: [{ path: './settings/settings.module.ts', meta: settingsModule }],
        models: [{ path: './settings/users/users.model.tsx', config: { ...usersModel, name: 'members' } }],
      })
    ).toThrow(/Model name mismatch/)
  })

  it('rejects module.models unknown references and duplicates', () => {
    expect(() =>
      compileMobileRouteCatalog({
        modules: [
          {
            path: './settings/settings.module.ts',
            meta: { ...settingsModule, models: ['users', 'users'] },
          },
        ],
        models: [{ path: './settings/users/users.model.tsx', config: usersModel }],
      })
    ).toThrow(/Duplicate model slug/)

    expect(() =>
      compileMobileRouteCatalog({
        modules: [
          {
            path: './settings/settings.module.ts',
            meta: { ...settingsModule, models: ['users', 'unknown-model'] },
          },
        ],
        models: [{ path: './settings/users/users.model.tsx', config: usersModel }],
      })
    ).toThrow(/Unknown model slug/)
  })

  it('rejects reserved static base path collisions', () => {
    expect(() =>
      compileMobileRouteCatalog({
        modules: [{ path: './profile/profile.module.ts', meta: { name: 'Profile' } }],
        models: [{ path: './profile/edit/edit.model.tsx', config: { ...usersModel, name: 'edit', title: 'Edit' } }],
      })
    ).toThrow(/collides with reserved static route path/)
  })
})
