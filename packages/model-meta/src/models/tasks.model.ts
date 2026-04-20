import type { ModelConfig } from '../types'

const tasks = {
  name: 'tasks',
  title: 'Tasks',
  fields: ['task_code', 'task_name', 'task_group', 'table_name', 'active'],
  fieldsAlias: {
    task_code: 'Kode Permission',
    task_name: 'Nama Permission',
    task_group: 'Grup Permission',
    table_name: 'Nama Tabel',
  },
  view: {
    list: {
      filter: {
        fields: ['active'],
      },
    },
  },
  transaction: {
    inputConfig: {
      task_code: {
        type: 'text',
        props: {
          validation: ['required'],
        },
      },
      task_name: {
        type: 'text',
        props: {
          validation: ['required'],
        },
      },
      task_group: {
        type: 'text',
        props: {
          validation: ['required'],
        },
      },
      table_name: {
        type: 'text',
        props: {
          validation: ['required'],
        },
      },
    },
  },
} satisfies ModelConfig

export default tasks
