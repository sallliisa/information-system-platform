import type { MobileModuleMeta } from '../catalog.types'

const settingsModule: MobileModuleMeta = {
  name: 'Settings',
  icon: 'settings-3-line',
  description: 'Manage application settings and access models.',
  order: 100,
  models: ['users', 'roles', 'tasks'],
}

export default settingsModule
