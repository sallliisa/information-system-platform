type RouterLike = {
  back: () => void
  replace: (href: any) => void
  canGoBack?: () => boolean
}

export function navigateBackOrFallback(router: RouterLike, fallbackHref: string): 'back' | 'fallback' {
  if (router.canGoBack?.()) {
    router.back()
    return 'back'
  }

  router.replace(fallbackHref as any)
  return 'fallback'
}
