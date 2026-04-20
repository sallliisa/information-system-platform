import { defineAsyncComponent } from 'vue'
import * as XLSX from 'xlsx'

export function composeInputTemplateSheet(createFormConfig: CreateConfig) {
  if (!createFormConfig.fields) return
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([createFormConfig.fields.map((field) => createFormConfig.fieldsAlias?.[field] || field)])
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${createFormConfig.targetAPI}.xlsx`)
}

export const bulkCreateFormProps: CreateConfig = {
  fields: ['data'],
  fieldsAlias: {
    data: 'File',
  },
  inputConfig: {
    data: {
      type: 'custom',
      component: defineAsyncComponent(() => import('@/components/composites/CRUD/_layouts/SpreadsheetReader.vue')),
      props: {
        required: true,
      },
    },
  },
}
