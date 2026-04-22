import {
  APP_PRIVATE_DUMMY_TAB_1_ROUTE_ID,
  APP_PRIVATE_DUMMY_TAB_2_ROUTE_ID,
  APP_PRIVATE_DUMMY_TAB_3_ROUTE_ID,
  APP_PRIVATE_MENU_ROUTE_ID,
  APP_PRIVATE_PROFILE_ROUTE_ID,
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
  specials: readonly AuthenticatedNavItem[]
}

function assertAuthenticatedNavConfig(config: AuthenticatedNavConfig): AuthenticatedNavConfig {
  const regularCount = config.regular.length
  if (regularCount < 1 || regularCount > 4) {
    throw new Error(`Authenticated nav requires 1 to 4 regular items. Received ${regularCount}.`)
  }

  const specialCount = config.specials.length
  if (specialCount < 1 || specialCount > 2) {
    throw new Error(`Authenticated nav requires 1 to 2 special items. Received ${specialCount}.`)
  }

  const totalItems = regularCount + specialCount
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
  ],
  specials: [
    { kind: 'special', routeId: APP_PRIVATE_PROFILE_ROUTE_ID, label: 'Profile', icon: 'user-3-line' },
    { kind: 'special', routeId: APP_PRIVATE_MENU_ROUTE_ID, label: 'Search', icon: 'search-line' },
  ],
})
