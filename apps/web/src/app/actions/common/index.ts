export function parseURL(url: string, prefix: string = '', suffix: string = '') {
  if (url.slice(-7) === '?custom') return url.slice(0, -7)
  else return prefix + url + suffix
}
