export type AuthenticatedLeftNavItem = {
  id: string
  label: string
  icon: string
  href: string
}

export type AuthenticatedRightLauncher = {
  id: string
  href: '/menu'
  icon: string
}

export type AuthenticatedNavConfig = {
  left: readonly AuthenticatedLeftNavItem[]
  rightLauncher: AuthenticatedRightLauncher
}

function assertValidInternalHref(href: string, field: string) {
  if (!href.startsWith('/')) {
    throw new Error(`${field} must start with '/'. Received '${href}'.`)
  }
}

function assertAuthenticatedNavConfig(config: AuthenticatedNavConfig): AuthenticatedNavConfig {
  if (config.left.length < 1 || config.left.length > 2) {
    throw new Error(`Authenticated nav left zone requires 1 to 2 items. Received ${config.left.length}.`)
  }

  if (!config.rightLauncher) {
    throw new Error('Authenticated nav requires a right launcher item.')
  }

  if (config.rightLauncher.href !== '/menu') {
    throw new Error(`Right launcher href must be '/menu'. Received '${config.rightLauncher.href}'.`)
  }

  const seenIds = new Set<string>()
  const seenHrefs = new Set<string>()

  for (const item of config.left) {
    assertValidInternalHref(item.href, `left item '${item.id}' href`)
    if (!item.icon) {
      throw new Error(`Left item '${item.id}' requires an icon.`)
    }
    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate nav id '${item.id}'.`)
    }
    if (seenHrefs.has(item.href)) {
      throw new Error(`Duplicate nav href '${item.href}'.`)
    }
    seenIds.add(item.id)
    seenHrefs.add(item.href)
  }

  assertValidInternalHref(config.rightLauncher.href, 'right launcher href')
  if (!config.rightLauncher.icon) {
    throw new Error('Right launcher requires an icon.')
  }

  if (seenIds.has(config.rightLauncher.id)) {
    throw new Error(`Duplicate nav id '${config.rightLauncher.id}'.`)
  }

  if (seenHrefs.has(config.rightLauncher.href)) {
    throw new Error(`Duplicate nav href '${config.rightLauncher.href}'.`)
  }

  return config
}

export const AUTHENTICATED_NAV_CONFIG = assertAuthenticatedNavConfig({
  left: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home-5-line', href: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: 'user-3-line', href: '/profile' },
  ],
  rightLauncher: { id: 'menu', href: '/menu', icon: 'apps-2-line' },
})
