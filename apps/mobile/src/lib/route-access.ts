import type { MobileRouteItem } from './route-manifest'

const VIEW_PREFIX = 'view-'

function normalizeToken(value: unknown): string {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
  return text
}

function addPermissionToken(set: Set<string>, value: unknown) {
  const token = normalizeToken(value)
  if (!token) return
  set.add(token)
  if (!token.startsWith(VIEW_PREFIX)) {
    set.add(`${VIEW_PREFIX}${token}`)
  }
}

function readObjectCandidates(item: Record<string, unknown>): unknown[] {
  const candidates: unknown[] = []
  const directKeys = ['permission', 'permissions', 'name', 'code', 'slug', 'id', 'task', 'value']
  for (const key of directKeys) {
    if (item[key] !== undefined) {
      candidates.push(item[key])
    }
  }

  const action = normalizeToken(item.action)
  const resource = normalizeToken(item.resource ?? item.module ?? item.subject)
  if (action && resource) {
    candidates.push(`${action}-${resource}`)
  }

  return candidates
}

export function normalizePermissions(input: unknown): Set<string> {
  const tokens = new Set<string>()
  const queue: unknown[] = [input]

  while (queue.length > 0) {
    const current = queue.shift()
    if (current === null || current === undefined) continue

    if (Array.isArray(current)) {
      for (const entry of current) queue.push(entry)
      continue
    }

    if (typeof current === 'string' || typeof current === 'number') {
      addPermissionToken(tokens, current)
      continue
    }

    if (typeof current === 'object') {
      const objectValue = current as Record<string, unknown>
      for (const candidate of readObjectCandidates(objectValue)) {
        queue.push(candidate)
      }
    }
  }

  return tokens
}

export function isSystemRoute(route: MobileRouteItem | null | undefined): route is MobileRouteItem & { routeType: 'system' } {
  return route?.routeType === 'system'
}

export function isAppPrivateRoute(route: MobileRouteItem | null | undefined): route is MobileRouteItem & { routeType: 'appPrivate' } {
  return route?.routeType === 'appPrivate'
}

export function isAppPublicRoute(route: MobileRouteItem | null | undefined): route is MobileRouteItem & { routeType: 'appPublic' } {
  return route?.routeType === 'appPublic'
}

export function hasPrivateRoutePermission(route: MobileRouteItem, permissionPayload: unknown): boolean {
  if (!isAppPrivateRoute(route)) return false
  const permissionKeyValue = 'permissionKey' in route ? route.permissionKey : undefined
  if (!permissionKeyValue) return true

  const permissions = normalizePermissions(permissionPayload)
  if (permissions.size === 0) {
    // Keep menu visible when permission payload is absent or still loading.
    return true
  }

  const permissionKey = normalizeToken(permissionKeyValue)
  if (!permissionKey) return true

  return permissions.has(permissionKey) || permissions.has(`${VIEW_PREFIX}${permissionKey}`)
}

export function filterPrivateMenuRoutes(routes: readonly MobileRouteItem[], permissionPayload: unknown): MobileRouteItem[] {
  return routes.filter((route) => hasPrivateRoutePermission(route, permissionPayload))
}
