export function groupBy(xs: any[], key: string) {
  return xs.reduce((rv, x) => {
    ;(rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {} as Record<string, any[]>)
}

export function getObjectValue(o: any, s: string): any {
  s = s.replace(/\[(\w+)\]/g, '.$1')
  s = s.replace(/^\./, '')
  const a = s.split('.')
  for (let i = 0; i < a.length; i++) {
    const k = a[i]
    if (k in o) o = o[k]
    else return undefined
  }
  return o
}
