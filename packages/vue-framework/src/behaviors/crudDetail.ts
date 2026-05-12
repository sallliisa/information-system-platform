import services from '@repo/vue-framework/adapters/services'

export async function defaultOnExport(detailConfig: any, id: number) {
  const base = detailConfig?.getAPI ? `${detailConfig.getAPI}` : ''
  if (!base) return
  return services.downloadFile(`${base}/export-buker/${id}`, `${base}_${new Date().toISOString()}.pdf`)
}
