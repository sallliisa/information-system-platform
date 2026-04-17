import services from '@/utils/services'

export async function defaultGetData(getAPI: string, searchParameters: object) {
  const { data } = await services.dataset(getAPI, { ...(searchParameters || {}) })
  return data
}
