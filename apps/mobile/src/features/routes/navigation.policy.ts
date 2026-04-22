import { normalizeRoutePath } from '../../lib/route-manifest'

type RouterLike = {
  back: () => void
  replace: (href: any) => void
  canGoBack?: () => boolean
}

export function isActivePath(currentPath: string | null | undefined, targetPath: string): boolean {
  return normalizeRoutePath(currentPath) === normalizeRoutePath(targetPath)
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
