import { filterPrivateMenuRoutes } from './route-access'

export type MobileRouteType = 'system' | 'appPrivate' | 'appPublic'

export type MobileRouteDefinition = {
  id: string
  href: `/${string}`
  title: string
  description: string
  group: string
  icon?: string
  permissionKey?: string
  routeType: MobileRouteType
}

export type MobileRouteSection = {
  title: string
  routes: readonly MobileRouteDefinition[]
}

export type MobileRouteManifest = {
  system: MobileRouteSection
  appPrivate: MobileRouteSection
  appPublic: MobileRouteSection
}

export const SYSTEM_LOGIN_ROUTE_ID = 'system.login' as const
export const APP_PRIVATE_MENU_ROUTE_ID = 'app.menu' as const
export const APP_PRIVATE_PROFILE_ROUTE_ID = 'app.profile' as const
export const APP_PRIVATE_PROFILE_EDIT_ROUTE_ID = 'app.profile.edit' as const
export const APP_PRIVATE_PROFILE_SETTINGS_ROUTE_ID = 'app.profile.settings' as const
export const APP_PRIVATE_DUMMY_TAB_1_ROUTE_ID = 'dummy.tab1' as const
export const APP_PRIVATE_DUMMY_TAB_2_ROUTE_ID = 'dummy.tab2' as const
export const APP_PRIVATE_DUMMY_TAB_3_ROUTE_ID = 'dummy.tab3' as const
export const APP_PRIVATE_DUMMY_TAB_4_ROUTE_ID = 'dummy.tab4' as const

export const DEFAULT_APP_PRIVATE_ROUTE_ID = APP_PRIVATE_DUMMY_TAB_1_ROUTE_ID
export const DEFAULT_APP_PUBLIC_ROUTE_ID = 'public.about' as const

export const MOBILE_ROUTE_MANIFEST = {
  system: {
    title: 'System',
    routes: [
      {
        id: SYSTEM_LOGIN_ROUTE_ID,
        href: '/login',
        title: 'Login',
        description: 'Guest sign-in page.',
        group: 'system',
        icon: 'lock-line',
        routeType: 'system',
      },
    ],
  },
  appPrivate: {
    title: 'Private App',
    routes: [
      {
        id: APP_PRIVATE_DUMMY_TAB_1_ROUTE_ID,
        href: '/dummy/tab-1',
        title: 'Tab 1',
        description: 'Placeholder tab screen for authenticated shell.',
        group: 'tabs',
        icon: 'home-5-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_DUMMY_TAB_2_ROUTE_ID,
        href: '/dummy/tab-2',
        title: 'Tab 2',
        description: 'Placeholder tab screen for authenticated shell.',
        group: 'tabs',
        icon: 'layout-grid-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_DUMMY_TAB_3_ROUTE_ID,
        href: '/dummy/tab-3',
        title: 'Tab 3',
        description: 'Placeholder tab screen for authenticated shell.',
        group: 'tabs',
        icon: 'repeat-2-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_DUMMY_TAB_4_ROUTE_ID,
        href: '/dummy/tab-4',
        title: 'Tab 4',
        description: 'Placeholder tab screen for authenticated shell.',
        group: 'tabs',
        icon: 'settings-3-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_PROFILE_ROUTE_ID,
        href: '/profile',
        title: 'Profile',
        description: 'User profile summary and quick actions.',
        group: 'profile',
        icon: 'user-3-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_PROFILE_EDIT_ROUTE_ID,
        href: '/profile/edit',
        title: 'Edit Profile',
        description: 'Manage profile identity and account details.',
        group: 'profile',
        icon: 'user-settings-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_PROFILE_SETTINGS_ROUTE_ID,
        href: '/profile/settings',
        title: 'Settings',
        description: 'Manage profile-related preferences.',
        group: 'profile',
        icon: 'settings-3-line',
        routeType: 'appPrivate',
      },
      {
        id: APP_PRIVATE_MENU_ROUTE_ID,
        href: '/menu',
        title: 'Search',
        description: 'Search authenticated routes and settings.',
        group: 'system',
        icon: 'search-line',
        routeType: 'appPrivate',
      },
    ],
  },
  appPublic: {
    title: 'Public App',
    routes: [
      {
        id: DEFAULT_APP_PUBLIC_ROUTE_ID,
        href: '/public/about',
        title: 'About',
        description: 'Public application information.',
        group: 'public',
        icon: 'information-line',
        routeType: 'appPublic',
      },
    ],
  },
} as const satisfies MobileRouteManifest

type ManifestSection = (typeof MOBILE_ROUTE_MANIFEST)[keyof typeof MOBILE_ROUTE_MANIFEST]
export type MobileRouteItem = ManifestSection['routes'][number]
export type MobileRouteId = MobileRouteItem['id']

export function buildRouteIndex(manifest: MobileRouteManifest): Map<string, MobileRouteDefinition> {
  const index = new Map<string, MobileRouteDefinition>()
  const routeList = [...manifest.system.routes, ...manifest.appPrivate.routes, ...manifest.appPublic.routes]
  for (const route of routeList) {
    index.set(route.id, route)
  }
  return index
}

const ROUTE_INDEX = buildRouteIndex(MOBILE_ROUTE_MANIFEST)
const ALL_ROUTES = [
  ...MOBILE_ROUTE_MANIFEST.system.routes,
  ...MOBILE_ROUTE_MANIFEST.appPrivate.routes,
  ...MOBILE_ROUTE_MANIFEST.appPublic.routes,
] as MobileRouteItem[]

export function normalizeRoutePath(path: string | null | undefined): string {
  let nextPath = String(path || '').trim()
  if (!nextPath) return ''

  const queryIndex = nextPath.indexOf('?')
  if (queryIndex >= 0) nextPath = nextPath.slice(0, queryIndex)

  const hashIndex = nextPath.indexOf('#')
  if (hashIndex >= 0) nextPath = nextPath.slice(0, hashIndex)

  if (!nextPath.startsWith('/')) nextPath = `/${nextPath}`

  // Remove hidden group segments like /(authenticated)
  nextPath = nextPath.replace(/\/\([^/]+\)/g, '')
  nextPath = nextPath.replace(/\/{2,}/g, '/')

  if (nextPath.length > 1 && nextPath.endsWith('/')) {
    nextPath = nextPath.slice(0, -1)
  }

  return nextPath
}

export function getRouteById(routeId: MobileRouteId): MobileRouteItem {
  const route = ROUTE_INDEX.get(routeId)
  if (!route) {
    throw new Error(`Unknown route id: ${routeId}`)
  }
  return route as MobileRouteItem
}

export function getRouteHref(routeId: MobileRouteId): MobileRouteItem['href'] {
  return getRouteById(routeId).href
}

export function getRoutesByType(routeType: MobileRouteType): MobileRouteItem[] {
  return ALL_ROUTES.filter((route) => route.routeType === routeType)
}

export function getPrivateMenuRoutes(permissionPayload: unknown): MobileRouteItem[] {
  return filterPrivateMenuRoutes(getRoutesByType('appPrivate'), permissionPayload)
}

export function getPublicMenuRoutes(): MobileRouteItem[] {
  return getRoutesByType('appPublic')
}

export function isLoginRoute(path: string | null | undefined): boolean {
  const normalizedPath = normalizeRoutePath(path)
  if (!normalizedPath) return false
  return normalizedPath === normalizeRoutePath(getRouteHref(SYSTEM_LOGIN_ROUTE_ID))
}
