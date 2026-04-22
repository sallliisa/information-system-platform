import roles from '@repo/model-meta/models/roles.model'
import type { MobileModelConfig } from '../../catalog.types'

const rolesModel: MobileModelConfig = {
  ...roles,
  permission: 'roles',
  icon: 'shield-line',
  description: 'Manage role configuration.',
}

export default rolesModel
