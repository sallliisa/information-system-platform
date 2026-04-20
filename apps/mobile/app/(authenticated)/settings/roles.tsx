import roles from '@repo/model-meta/models/roles.model'
import { CRUDComposite } from '../../../src/components/composites/CRUDComposite'

export default function RolesScreen() {
  return <CRUDComposite config={roles} />
}
