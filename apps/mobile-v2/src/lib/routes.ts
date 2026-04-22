export const LOGIN_ROUTE = '/login'
export const DEFAULT_AUTH_ROUTE = '/dashboard'

function normalizeRouteForMatch(path: string | null | undefined): string {
  let nextPath = String(path || '').trim()
  if (!nextPath) return ''

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

export function isLoginRoute(path: string | null | undefined): boolean {
  return normalizeRouteForMatch(path) === LOGIN_ROUTE
}

export function normalizeInternalRedirect(path: string | null | undefined): string | null {
  const trimmedPath = String(path || '').trim()
  if (!trimmedPath) return null
  if (!trimmedPath.startsWith('/')) return null
  if (trimmedPath.startsWith('//')) return null
  if (isLoginRoute(trimmedPath)) return null
  return trimmedPath
}
