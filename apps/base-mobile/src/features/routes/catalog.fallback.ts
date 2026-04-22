import type { CatalogCompilerSources } from './catalog.compiler'
import settingsModule from './settings/settings.module'
import usersModel from './settings/users/users.model'

export function getFallbackCatalogSources(): CatalogCompilerSources {
  return {
    modules: [{ path: './settings/settings.module.ts', meta: settingsModule }],
    models: [{ path: './settings/users/users.model.tsx', config: usersModel }],
  }
}
