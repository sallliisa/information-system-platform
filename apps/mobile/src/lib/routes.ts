import {
  SYSTEM_LOGIN_ROUTE_ID,
  getRouteHref,
  isLoginRoute as isManifestLoginRoute,
} from './route-manifest'
import { getDefaultPrivateRouteHref } from '../features/routes/catalog.index'

export const LOGIN_ROUTE = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)
export const DEFAULT_AUTH_ROUTE = '/menu'

export function resolveDefaultAuthRoute(permissionPayload: unknown): string {
  return getDefaultPrivateRouteHref(permissionPayload, DEFAULT_AUTH_ROUTE)
}

export function isLoginRoute(path: string | null | undefined): boolean {
  return isManifestLoginRoute(path)
}
