import users from '@repo/model-meta/models/users.model'
import { CRUDComposite } from '../../../src/components/composites/CRUDComposite'

export default function UsersScreen() {
  return <CRUDComposite config={users} />
}
