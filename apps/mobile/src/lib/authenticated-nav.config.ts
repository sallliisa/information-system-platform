import {
  APP_PRIVATE_DUMMY_TAB_1_ROUTE_ID,
  APP_PRIVATE_DUMMY_TAB_2_ROUTE_ID,
  APP_PRIVATE_DUMMY_TAB_3_ROUTE_ID,
  APP_PRIVATE_DUMMY_TAB_4_ROUTE_ID,
  APP_PRIVATE_MENU_ROUTE_ID,
  type MobileRouteId,
} from './route-manifest'

type AuthenticatedNavItem = {
  kind: 'regular' | 'special'
  routeId: MobileRouteId
  label: string
  icon: string
}

export type AuthenticatedNavConfig = {
  regular: readonly AuthenticatedNavItem[]
  special: AuthenticatedNavItem
}

function assertAuthenticatedNavConfig(config: AuthenticatedNavConfig): AuthenticatedNavConfig {
  const regularCount = config.regular.length
  if (regularCount < 1 || regularCount > 4) {
    throw new Error(`Authenticated nav requires 1 to 4 regular items. Received ${regularCount}.`)
  }

  const totalItems = regularCount + 1
  if (totalItems > 5) {
    throw new Error(`Authenticated nav supports up to 5 items. Received ${totalItems}.`)
  }

  return config
}

export const AUTHENTICATED_NAV_CONFIG = assertAuthenticatedNavConfig({
  regular: [
    { kind: 'regular', routeId: APP_PRIVATE_DUMMY_TAB_1_ROUTE_ID, label: 'Tab 1', icon: 'home-5-line' },
    { kind: 'regular', routeId: APP_PRIVATE_DUMMY_TAB_2_ROUTE_ID, label: 'Tab 2', icon: 'layout-grid-line' },
    { kind: 'regular', routeId: APP_PRIVATE_DUMMY_TAB_3_ROUTE_ID, label: 'Tab 3', icon: 'repeat-2-line' },
    { kind: 'regular', routeId: APP_PRIVATE_DUMMY_TAB_4_ROUTE_ID, label: 'Tab 4', icon: 'settings-3-line' },
  ],
  special: { kind: 'special', routeId: APP_PRIVATE_MENU_ROUTE_ID, label: 'Search', icon: 'search-line' },
})
