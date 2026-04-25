import type { MobileModuleMeta } from '../catalog.types'

const settingsModule: MobileModuleMeta = {
  name: 'Settings',
  icon: 'settings-3',
  description: 'Manage application settings and access models.',
  order: 100,
  models: ['users'],
}

export default settingsModule
