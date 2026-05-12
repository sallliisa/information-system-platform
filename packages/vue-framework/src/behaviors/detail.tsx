import services from '@repo/vue-framework/adapters/services'

export async function defaultDetailGetData(getAPI: string, searchParameters?: Record<string, any>, getDataID?: string) {
  const { data } = await services.detail(getAPI, getDataID, searchParameters)
  return data
}

export function defaultOnDataLoaded() {
  return
}

export const detailFieldTypes: Record<string, any> = {}
