import { defineStore } from 'pinia'
import menu from '@/menu'
import { permissions } from './permissions'

const value: Array<Module> = []

export const modules = defineStore('modules', () => {
  function build() {
    const start = performance.now()
    clear()
    menu.forEach((item) => {
      if (item.routes.length === 1) return permissions().has(`view-${item.permission || item.name}`) ? value.push(item) : null
      const routes = (item.routes as any).filter((route: any) => {
        if (route.separator) return true
        if (route.name) {
          // console.log('checking', `view-${route.permission || route.name}`, permissions().has(`view-${route.permission || route.name}`))
          return permissions().has(`view-${route.permission || route.name}`)
        }
      })
      console.log('final routes', routes)
      for (let i = 0; i < routes.length - 1; i++) {
        if (routes[i].separator && routes[i + 1].separator) {
          routes.splice(i, 1)
          i--
        }
      }
      if (routes.length > 0 && routes[routes.length - 1].separator) {
        routes.splice(routes.length - 1, 1)
      }
      if (routes.length != 0) value.push({ ...item, routes })
    })
    const end = performance.now()
    console.log(`BUILT MODULES IN ${end - start}ms`, value)
    return true
  }
  function clear() {
    value.splice(0, value.length)
  }
  function rebuild() {
    clear()
    build()
  }

  if (!value?.length) build()
  return { value, build, clear, rebuild }
})

export function transformData(data: any[]) {
  return data
    .map((item) => {
      const newRoutes: any[] = []
      let currentSection: any = null

      item.routes.forEach((route: any) => {
        if (permissions().has(`view-${route.permission || route.name}`) || route.separator) {
          if (route.separator) {
            if (currentSection && currentSection.routes.length > 0) {
              newRoutes.push(currentSection)
            }
            currentSection = {
              section: route.name,
              routes: [],
            }
          } else if (currentSection) {
            currentSection.routes.push(route)
          }
        }
      })

      if (currentSection && currentSection.routes.length > 0) {
        newRoutes.push(currentSection)
      }

      return newRoutes.length > 0
        ? {
            ...item,
            routes: newRoutes,
          }
        : null
    })
    .filter((item) => item !== null)
}
