import _app from '@/app/configs/_app'
import { storage } from '@/utils/storage'
import { savePostLoginRedirect } from '@/utils/post-login-redirect'
import { getDefaultAuthenticatedRouteLocation } from './navigation'
import type { NavigationGuard } from 'vue-router'

export function isPublicRoute(routeName: unknown): boolean {
  return _app.unprotectedRoutes.includes(String(routeName))
}

export function createAuthGuard(): NavigationGuard {
  return (to) => {
    const token = storage.cookie.get('token')

    if (isPublicRoute(to.name)) {
      if (token && String(to.name) === 'login') {
        return getDefaultAuthenticatedRouteLocation() ?? { name: 'login' }
      }
      return true
    }

    if (!token) {
      savePostLoginRedirect(to.fullPath)
      return { name: 'login' }
    }

    if (to.path === '/') {
      return getDefaultAuthenticatedRouteLocation() ?? { name: 'login' }
    }

    if (!to.matched.length) {
      return { name: 'not-found' }
    }

    return true
  }
}
