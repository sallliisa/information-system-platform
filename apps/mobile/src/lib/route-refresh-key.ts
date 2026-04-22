import { normalizeRoutePath } from './route-manifest'

export function buildRouteRefreshKey(pathname: string | null | undefined): string {
  const normalizedPath = normalizeRoutePath(pathname || '/') || '/'
  return normalizedPath
}

export function buildRouteRefreshKeyId(pathname: string | null | undefined): string {
  return `route:${buildRouteRefreshKey(pathname)}`
}
