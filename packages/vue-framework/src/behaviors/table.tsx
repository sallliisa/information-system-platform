import services from '@southneuhof/is-vue-framework/services'

export async function defaultTableGetData(getAPI: string, searchParameters?: Record<string, number | string | undefined>) {
  return (await services.list(getAPI, searchParameters)) as { data: Record<string, any>[]; totalPage: number; total: number }
}

export function defaultOnDataLoaded() {
  return
}

export const tableFieldTypes: Record<string, any> = {}
