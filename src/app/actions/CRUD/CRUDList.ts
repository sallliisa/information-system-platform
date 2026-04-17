import { keyManager } from '@/stores/keyManager'
import services from '@/utils/services'
import { toast } from 'vue-sonner'
import { parse } from '@/utils/filter'
import * as XLSX from 'xlsx'

export async function onDelete(endpoint: string, id: Object, key: string = 'm-table') {
  await services
    .delete(endpoint, { id })
    .then((res) => {
      toast.success('Data berhasil dihapus!')
      keyManager().triggerChange(key)
    })
    .catch((err) => {
      toast.error(err.data.message)
    })
}

export async function defaultOnExport({ exportAPI, params, listConfig }: { exportAPI: string; params: Record<string, any>; listConfig: ListConfig }) {
  const response = await services.raw(exportAPI, { ...params, limit: 99999 })
  const contentType = response.headers.get('Content-Type') || ''

  // If backend returns a file (blob), download it directly
  if (contentType.includes('application/vnd.openxmlformats') || contentType.includes('application/octet-stream') || contentType.includes('application/vnd.ms-excel')) {
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `${exportAPI.split('/').pop() || 'export'}.xlsx`

    // Try to extract filename from Content-Disposition header
    if (contentDisposition) {
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameStarMatch?.[1]) filename = decodeURIComponent(filenameStarMatch[1])
      else if (filenameMatch?.[1]) filename = filenameMatch[1].replace(/['"]/g, '')
    }

    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
    return
  }

  // Otherwise, parse JSON and generate XLSX locally
  const { data } = await response.json()
  const sheetData = data.map((row: any) =>
    Object.fromEntries(listConfig.fields!.map((field) => [listConfig.fieldsAlias?.[field] || field, listConfig.fieldsParse?.[field] ? parse(listConfig.fieldsParse?.[field], row[field]) : row[field]]))
  )
  const ws = XLSX.utils.json_to_sheet(sheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${exportAPI.split('/').pop() || 'export'}.xlsx`)
}

export function defaultOnDragChange(reorderAPI: string, event: any) {
  if (!event.moved) return
  services.post('reorder', {
    model: reorderAPI,
    data: {
      ...event.moved.element,
      new_order_number: event.moved.newIndex + 1,
    },
  })
}
