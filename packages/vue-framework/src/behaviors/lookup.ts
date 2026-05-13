import services from '@southneuhof/is-vue-framework/services'

export async function defaultGetData(getAPI: string, searchParameters: object) {
  const { data, total, totalPage } = await services.dataset(getAPI, { active: true, ...searchParameters })
  return { data, total, totalPage }
}

export async function defaultGetDetail(getAPI: string, id: string | number, searchParameters?: object) {
  const { data } = await services.detail(getAPI, id, { active: true, ...(searchParameters || {}) })
  return data
}

export function defaultDataFormatter(data: Array<Record<string, any>>, allowMulti: boolean, pick: string) {
  if (!allowMulti) return data[0]?.[pick]
  return data
}

export const defaultFieldsAlias: Record<string, string> = {}
