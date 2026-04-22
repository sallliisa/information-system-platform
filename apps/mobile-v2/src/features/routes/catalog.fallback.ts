import settingsModule from './settings/settings.module'
import usersModel from './settings/users/users.model'
import rolesModel from './settings/roles/roles.model'
import tasksModel from './settings/tasks/tasks.model'
import type { CatalogCompilerSources } from './catalog.compiler'

export function getFallbackCatalogSources(): CatalogCompilerSources {
  return {
    modules: [{ path: './settings/settings.module.ts', meta: settingsModule }],
    models: [
      { path: './settings/users/users.model.tsx', config: usersModel },
      { path: './settings/roles/roles.model.tsx', config: rolesModel },
      { path: './settings/tasks/tasks.model.tsx', config: tasksModel },
    ],
  }
}
