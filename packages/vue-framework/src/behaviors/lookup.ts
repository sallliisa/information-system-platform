export async function defaultGetData() {
  throw new Error('[vue-framework] defaultGetData(lookup) is not implemented yet. Pass getData explicitly or install framework services later.')
}

export async function defaultGetDetail() {
  throw new Error('[vue-framework] defaultGetDetail(lookup) is not implemented yet. Pass getDetail explicitly or install framework services later.')
}

export function defaultDataFormatter(data: Array<Record<string, any>>, allowMulti: boolean, pick: string) {
  if (!allowMulti) return data[0]?.[pick]
  return data
}

export const defaultFieldsAlias: Record<string, string> = {}
