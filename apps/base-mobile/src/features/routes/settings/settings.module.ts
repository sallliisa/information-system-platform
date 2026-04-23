import type { MobileModuleMeta } from '../catalog.types'

const settingsModule: MobileModuleMeta = {
  name: 'Settings',
  icon: 'settings',
  description: 'Manage application settings and access models.',
  order: 100,
  models: ['users'],
}

export default settingsModule
