import tasks from '@repo/model-meta/models/tasks.model'
import { CRUDComposite } from '../../../src/components/composites/CRUDComposite'

export default function TasksScreen() {
  return <CRUDComposite config={tasks} />
}
