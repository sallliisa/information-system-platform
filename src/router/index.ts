import { createRouter, createWebHashHistory } from 'vue-router'
import menu from '../menu'
import _app from '@/app/configs/_app'
import services from '@/utils/services'
import { storage } from '@/utils/storage'
import { modules } from '@/stores/modules'
import { savePostLoginRedirect } from '@/utils/post-login-redirect'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/unauthenticated/login',
      name: 'login',
      component: () => import('@/views/unauthenticated/login/login.vue'),
    },
  ],
})

for (const module of menu as any) {
  for (const submodule of module.routes) {
    if (!submodule.separator) {
      if (submodule.children) {
        const children = (submodule.children as Array<Module>).map((child) => {
          return {
            path: '/' + module.name.toLowerCase() + '/' + submodule.name.toLowerCase() + '/' + child.name.toLowerCase(),
            name: child.name,
            component: () => import(`@/views/authenticated/${module.name}/${submodule.name}/children/${child.name}.vue`),
            meta: { title: child.title, ...child.meta, module_title: module.title },
          }
        })
        router.addRoute({
          path: '/' + module.name.toLowerCase() + '/' + submodule.name.toLowerCase(),
          name: submodule.name,
          component: () => import(`@/views/authenticated/${module.name}/${submodule.name}/${submodule.name}.vue`),
          meta: { title: submodule.title, ...submodule.meta, module_title: module.title, children: submodule.children ? submodule.children : null },
          children: children,
        })
      } else {
        router.addRoute({
          path: '/' + module.name.toLowerCase() + '/' + submodule.name.toLowerCase(),
          name: submodule.name,
          component: () => import(`@/views/authenticated/${module.name}/${submodule.name}/${submodule.name}.vue`),
          meta: { title: submodule.title, ...submodule.meta, module_title: module.title, pages: submodule.routes ? submodule.routes : null },
        })
      }
    }
  }
}

router.beforeEach((to) => {
  const isUnprotectedRoute = _app.unprotectedRoutes.includes(String(to.name))
  if (isUnprotectedRoute) return true

  const token = storage.cookie.get('token')
  if (!token) {
    savePostLoginRedirect(to.fullPath)

    return { name: 'login' }
  }

  if (to.path === '/') {
    const firstRoute = modules().value[0]?.routes.find((x: any) => !x.separator)
    return firstRoute ? { name: firstRoute.name } : { name: 'login' }
  }

  if (!to.matched.length) {
    services.signOut()
    return false
  }

  return true
})

export default router
