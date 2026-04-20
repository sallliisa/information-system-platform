import services from '@/utils/services'
import { defaultGlobalConfig } from '../configs/_defaults'

export async function defaultGetData(getAPI: string, searchParameters: object) {
  const { data, total, totalPage } = await services.dataset(getAPI, { active: true, ...searchParameters })
  return { data: data, total, totalPage }
}

export async function defaultGetDetail(getAPI: string, id: string | number, searchParameters?: object) {
  const { data } = await services.detail(getAPI, id, { active: true, ...(searchParameters || {}) })
  return data
}

export function defaultDataFormatter(data: Array<Record<string, any>>, allowMulti: boolean, pick: string, view: string) {
  if (!allowMulti) return data[0]?.[pick]
  else return data
}

export const defaultFieldsAlias = defaultGlobalConfig.fieldsAlias

export async function onSaveData(postAPI: string, postData: object) {
  return null
}
