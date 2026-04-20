import {
  DEFAULT_APP_PRIVATE_ROUTE_ID,
  SYSTEM_LOGIN_ROUTE_ID,
  getRouteHref,
  isLoginRoute as isManifestLoginRoute,
} from './route-manifest'

export const LOGIN_ROUTE = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)
export const DEFAULT_AUTH_ROUTE = getRouteHref(DEFAULT_APP_PRIVATE_ROUTE_ID)

export function isLoginRoute(path: string | null | undefined): boolean {
  return isManifestLoginRoute(path)
}
