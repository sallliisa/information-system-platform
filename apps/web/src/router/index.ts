import { createRouter, createWebHashHistory } from 'vue-router'
import { buildLayoutRoutes, createLayoutViewResolver } from '@southneuhof/is-vue-framework/router'
import type { FrameworkRouteModule } from '@southneuhof/is-vue-framework/router'
import AuthenticatedLayout from '@/layouts/Authenticated.vue'
import UnauthenticatedLayout from '@/layouts/Unauthenticated.vue'
import menu from '@/menu'
import { createAuthGuard } from './guards'

const authenticatedViews = import.meta.glob('/src/views/authenticated/**/*.vue')
const unauthenticatedViews = import.meta.glob('/src/views/unauthenticated/**/*.vue')

const resolver = createLayoutViewResolver({
  authenticated: {
    path: '/src/views/authenticated',
    layout: AuthenticatedLayout,
    views: authenticatedViews,
  },
  unauthenticated: {
    path: '/src/views/unauthenticated',
    layout: UnauthenticatedLayout,
    views: unauthenticatedViews,
  },
})

const loginRoute = {
  path: '/unauthenticated/auth/login',
  name: 'login',
  component: resolver.resolveRouteView({
    layoutKey: 'unauthenticated',
    moduleName: 'auth',
    routeName: 'login',
  }),
}

const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('@/layouts/Blank.vue'),
  meta: { title: 'Not Found' },
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    loginRoute,
    ...buildLayoutRoutes(menu as unknown as FrameworkRouteModule[], {
      resolver,
      resolveLayoutKey: () => 'authenticated',
    }),
    notFoundRoute,
  ],
})

router.beforeEach(createAuthGuard())

export default router
