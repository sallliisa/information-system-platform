function normalizeRoutePath(pathname: string | null | undefined): string {
  let nextPath = String(pathname || '').trim()
  if (!nextPath) return '/'

  const queryIndex = nextPath.indexOf('?')
  if (queryIndex >= 0) nextPath = nextPath.slice(0, queryIndex)

  const hashIndex = nextPath.indexOf('#')
  if (hashIndex >= 0) nextPath = nextPath.slice(0, hashIndex)

  if (!nextPath.startsWith('/')) {
    nextPath = `/${nextPath}`
  }

  if (nextPath.length > 1 && nextPath.endsWith('/')) {
    nextPath = nextPath.slice(0, -1)
  }

  return nextPath
}

export function buildRouteRefreshKey(pathname: string | null | undefined): string {
  return normalizeRoutePath(pathname || '/') || '/'
}

export function buildRouteRefreshKeyId(pathname: string | null | undefined): string {
  return `route:${buildRouteRefreshKey(pathname)}`
}
