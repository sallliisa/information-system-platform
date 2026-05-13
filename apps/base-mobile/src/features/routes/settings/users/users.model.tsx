import users from '@client/data-model/models/mobile/users.model'
import type { MobileModelConfig } from '../../catalog.types'

const usersModel: MobileModelConfig = {
  ...users,
  icon: 'team',
  description: 'Manage application users.',
}

export default usersModel
