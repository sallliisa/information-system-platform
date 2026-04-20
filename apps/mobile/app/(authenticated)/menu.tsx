import Icon from 'react-native-remix-icon'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useRegisterBottomAccessory } from '../../src/hooks/useBottomOffset'
import { SearchBox } from '../../src/components/composites'
import { getPrivateMenuCatalogRoutes, type MobileRouteItem } from '../../src/lib/route-manifest'
import { getPermissions } from '../../src/lib/storage'
import { materialColors } from '../../src/theme/material'

const SEARCH_BAR_HEIGHT = 52
const SEARCH_TO_NAVBAR_GAP = 10

function normalizeForSearch(value: string): string {
  return value.trim().toLowerCase()
}

function formatGroupTitle(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export default function AuthenticatedMenuScreen() {
  const router = useRouter()
  const [permissionPayload, setPermissionPayload] = useState<unknown>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const permissions = await getPermissions()
      if (!mounted) return
      setPermissionPayload(permissions)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const routes = useMemo(() => getPrivateMenuCatalogRoutes(permissionPayload), [permissionPayload])

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query)
    if (!normalizedQuery) return routes
    return routes.filter((route) => {
      return (
        normalizeForSearch(route.title).includes(normalizedQuery) ||
        normalizeForSearch(route.description).includes(normalizedQuery) ||
        normalizeForSearch(route.group).includes(normalizedQuery)
      )
    })
  }, [query, routes])

  const groupedRoutes = useMemo(() => {
    const groups = new Map<string, MobileRouteItem[]>()
    for (const route of filteredRoutes) {
      const groupKey = route.group || 'general'
      const current = groups.get(groupKey)
      if (current) {
        current.push(route)
      } else {
        groups.set(groupKey, [route])
      }
    }
    return Array.from(groups.entries())
  }, [filteredRoutes])

  const searchBar = useMemo(() => {
    return <SearchBox value={query} onChangeText={setQuery} placeholder="Search routes, settings, transactions..." />
  }, [query])

  useRegisterBottomAccessory({
    height: SEARCH_BAR_HEIGHT,
    gapFromNavbar: SEARCH_TO_NAVBAR_GAP,
    element: searchBar,
  })

  return (
    <View className="gap-7">
      {groupedRoutes.length === 0 ? (
        <View
          className="mt-3 gap-1.5 rounded-2xl px-4 py-5"
          style={{ backgroundColor: materialColors.surfaceContainerLow }}
        >
          <Text className="text-base font-semibold" style={{ color: materialColors.onSurface }}>
            No routes found
          </Text>
          <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>
            Try a different search keyword.
          </Text>
        </View>
      ) : (
        groupedRoutes.map(([group, groupRoutes]) => (
          <View key={group} className="gap-3">
            <Text className="text-xl font-bold tracking-[-0.4px]" style={{ color: materialColors.onSurface }}>
              {formatGroupTitle(group)}
            </Text>
            <View className="grid grid-cols-4 gap-y-3">
              {groupRoutes.map((route) => (
                <Pressable
                  key={route.id}
                  className="items-center justify-center gap-3 p-2"
                  // style={{ backgroundColor: materialColors.surfaceContainerLow }}
                  onPress={() => router.push(route.href as any)}
                >
                  <View
                    className="h-[54px] w-[54px] items-center justify-center rounded-full"
                    style={{ backgroundColor: materialColors.surfaceContainer }}
                  >
                    <Icon name={(route.icon || 'apps-2-line') as any} size={24} color={materialColors.primary} fallback={null} />
                  </View>
                  <Text className="text-center text-[15px] font-medium" style={{ color: materialColors.onSurface }}>
                    {route.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  )
}
