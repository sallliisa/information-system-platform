function normalizePath(path: string | null | undefined): string {
  let nextPath = String(path || '').trim()
  if (!nextPath) return '/'

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

const DYNAMIC_CATALOG_PATH_PATTERN = /^\/[^/]+\/[^/]+\/(?:list|create|detail\/[^/]+|update\/[^/]+)$/

type RouterLike = {
  back: () => void
  replace: (href: any) => void
  canGoBack?: () => boolean
}

export function isActivePath(currentPath: string | null | undefined, targetPath: string): boolean {
  return normalizePath(currentPath) === normalizePath(targetPath)
}

export function getActiveTopLevelPath(
  currentPath: string | null | undefined,
  topLevelPaths: readonly string[],
  fallbackPath: string
): string {
  const normalizedCurrent = normalizePath(currentPath)

  for (const candidatePath of topLevelPaths) {
    const normalizedCandidate = normalizePath(candidatePath)
    if (normalizedCurrent === normalizedCandidate) return normalizedCandidate
    if (normalizedCurrent.startsWith(`${normalizedCandidate}/`)) return normalizedCandidate
  }

  return normalizePath(fallbackPath)
}

export function isDynamicCatalogPath(path: string | null | undefined): boolean {
  return DYNAMIC_CATALOG_PATH_PATTERN.test(normalizePath(path))
}

export function navigateAsSwitch(router: RouterLike, currentPath: string | null | undefined, targetPath: string): boolean {
  if (isActivePath(currentPath, targetPath)) return false
  router.replace(targetPath as any)
  return true
}

export function navigateBackOrFallback(router: RouterLike, fallbackHref: string): 'back' | 'fallback' {
  if (router.canGoBack?.()) {
    router.back()
    return 'back'
  }

  router.replace(fallbackHref as any)
  return 'fallback'
}
