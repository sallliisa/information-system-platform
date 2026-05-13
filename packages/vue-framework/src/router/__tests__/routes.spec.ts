import { describe, expect, it } from 'vitest'
import type { FrameworkRouteModule, LayoutViewResolver } from '../types'
import { buildLayoutRoutes } from '../routes'

function createResolver(): LayoutViewResolver {
  return {
    resolveRouteView: ({ layoutKey, moduleName, routeName }) => {
      if (moduleName === 'missing') {
        throw new Error(`Missing layout view: /src/views/${layoutKey}/${moduleName}/${routeName}/${routeName}.vue`)
      }
      return () => Promise.resolve({})
    },
    resolveChildView: () => () => Promise.resolve({}),
    resolveLayout: () => ({} as any),
  }
}

describe('buildLayoutRoutes', () => {
  it('builds expected paths and metadata from menu entries', () => {
    const modules: FrameworkRouteModule[] = [
      {
        name: 'dashboard',
        title: 'Dashboard',
        routes: [{ name: 'dashboard', title: 'Dashboard' }],
      },
      {
        name: 'settings',
        title: 'Pengaturan',
        routes: [
          { separator: true, name: 'System', title: 'System' },
          { name: 'users', title: 'Users' },
          { name: 'roles', title: 'Roles' },
          { name: 'tasks', title: 'Tasks' },
        ],
      },
    ]

    const routes = buildLayoutRoutes(modules, {
      resolver: createResolver(),
      resolveLayoutKey: () => 'authenticated',
    })

    const paths = routes.map((route) => route.path)
    expect(paths).toContain('/dashboard/dashboard')
    expect(paths).toContain('/settings/users')
    expect(paths).toContain('/settings/roles')
    expect(paths).toContain('/settings/tasks')
    expect(routes.some((route) => route.name === 'System')).toBe(false)

    const usersRoute = routes.find((route) => route.name === 'users')
    expect(usersRoute?.meta).toMatchObject({
      title: 'Users',
      module_title: 'Pengaturan',
    })
  })

  it('throws a clear error when configured view is missing', () => {
    const modules: FrameworkRouteModule[] = [
      {
        name: 'missing',
        title: 'Missing',
        routes: [{ name: 'users', title: 'Users' }],
      },
    ]

    expect(() =>
      buildLayoutRoutes(modules, {
        resolver: createResolver(),
        resolveLayoutKey: () => 'authenticated',
      }),
    ).toThrow('Missing layout view: /src/views/authenticated/missing/users/users.vue')
  })
})
