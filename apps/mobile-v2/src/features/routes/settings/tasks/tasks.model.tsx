import tasks from '@repo/model-meta/models/tasks.model'
import type { MobileModelConfig } from '../../catalog.types'

const tasksModel: MobileModelConfig = {
  ...tasks,
  permission: 'tasks',
  icon: 'task-line',
  description: 'Manage task permissions.',
}

export default tasksModel
