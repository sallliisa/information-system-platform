import type { Href } from 'expo-router'
import {
  DEFAULT_APP_PRIVATE_ROUTE_ID,
  DEFAULT_APP_PUBLIC_ROUTE_ID,
  MOBILE_ROUTE_MANIFEST,
  SYSTEM_LOGIN_ROUTE_ID,
  getRouteById,
  type MobileRouteId,
  type MobileRouteItem,
} from './route-manifest'

type Assert<T extends true> = T

type _AllHrefsAreExpoTypedRoutes = Assert<MobileRouteItem['href'] extends Href ? true : false>
type _LoginRouteIdExists = Assert<typeof SYSTEM_LOGIN_ROUTE_ID extends MobileRouteId ? true : false>
type _DefaultPrivateRouteIdExists = Assert<typeof DEFAULT_APP_PRIVATE_ROUTE_ID extends MobileRouteId ? true : false>
type _DefaultPublicRouteIdExists = Assert<typeof DEFAULT_APP_PUBLIC_ROUTE_ID extends MobileRouteId ? true : false>
type _LoginRouteIsSystem = Assert<
  Extract<MobileRouteItem, { id: typeof SYSTEM_LOGIN_ROUTE_ID }>['routeType'] extends 'system' ? true : false
>
type _DefaultPrivateRouteIsPrivate = Assert<
  Extract<MobileRouteItem, { id: typeof DEFAULT_APP_PRIVATE_ROUTE_ID }>['routeType'] extends 'appPrivate' ? true : false
>
type _DefaultPublicRouteIsPublic = Assert<
  Extract<MobileRouteItem, { id: typeof DEFAULT_APP_PUBLIC_ROUTE_ID }>['routeType'] extends 'appPublic' ? true : false
>

const loginRoute = getRouteById(SYSTEM_LOGIN_ROUTE_ID)
const defaultPrivateRoute = getRouteById(DEFAULT_APP_PRIVATE_ROUTE_ID)
const defaultPublicRoute = getRouteById(DEFAULT_APP_PUBLIC_ROUTE_ID)

const _manifestShapeCheck: keyof typeof MOBILE_ROUTE_MANIFEST = 'system'
const _hrefCheck: Href[] = [loginRoute.href, defaultPrivateRoute.href, defaultPublicRoute.href]

void _manifestShapeCheck
void _hrefCheck
