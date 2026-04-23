import users from '@repo/model-meta/models/users.model'
import type { MobileModelConfig } from '../../catalog.types'

const usersModel: MobileModelConfig = {
  ...users,
  icon: 'team-line',
  description: 'Manage application users.',
}

export default usersModel
