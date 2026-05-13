import type { RouteRecordRaw } from 'vue-router'
import type { FrameworkRouteItem, FrameworkRouteModule, LayoutRouteBuildOptions } from './types'

function toPathSegment(value: string): string {
  return String(value).toLowerCase()
}

function buildRoutePath(moduleName: string, routeName: string): string {
  return `/${toPathSegment(moduleName)}/${toPathSegment(routeName)}`
}

function buildChildPath(moduleName: string, routeName: string, childName: string): string {
  return `${buildRoutePath(moduleName, routeName)}/${toPathSegment(childName)}`
}

function isSeparatorRoute(route: FrameworkRouteItem): boolean {
  return Boolean(route.separator)
}

export function buildLayoutRoutes(modules: FrameworkRouteModule[], options: LayoutRouteBuildOptions): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  const includeModuleTitleMeta = options.includeModuleTitleMeta !== false

  for (const module of modules) {
    for (const route of module.routes) {
      if (isSeparatorRoute(route)) continue

      const layoutKey = options.resolveLayoutKey({ module, route, isChild: false })
      const baseRoute: RouteRecordRaw & { children?: RouteRecordRaw[] } = {
        path: buildRoutePath(module.name, route.name),
        name: route.name,
        component: options.resolver.resolveRouteView({
          layoutKey,
          moduleName: module.name,
          routeName: route.name,
        }),
        meta: {
          title: route.title,
          ...route.meta,
          ...(includeModuleTitleMeta ? { module_title: module.title } : {}),
        },
      }

      if (route.children?.length) {
        const children: RouteRecordRaw[] = route.children.map((child) => {
          const childLayoutKey = options.resolveLayoutKey({ module, route, isChild: true, child })

          return {
            path: buildChildPath(module.name, route.name, child.name),
            name: child.name,
            component: options.resolver.resolveChildView({
              layoutKey: childLayoutKey,
              moduleName: module.name,
              routeName: route.name,
              childName: child.name,
            }),
            meta: {
              title: child.title,
              ...child.meta,
              ...(includeModuleTitleMeta ? { module_title: module.title } : {}),
            },
          }
        })

        baseRoute.meta = { ...baseRoute.meta, children: route.children }
        ;(baseRoute as { children?: RouteRecordRaw[] }).children = children
      } else {
        baseRoute.meta = { ...baseRoute.meta, pages: route.routes || null }
      }

      routes.push(baseRoute)
    }
  }

  return routes
}
