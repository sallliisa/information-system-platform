import Icon from 'react-native-remix-icon'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SearchBox } from '../../../src/components/composites'
import { getPermissions } from '../../../src/lib/storage'
import { materialColors } from '../../../src/theme/material'
import { getMobileRouteCatalog, selectCatalogMenuEntries } from '../../../src/features/routes/catalog.index'
import { buildMenuGroups, chunkItems, filterMenuEntries, formatGroupTitle } from '../../../src/features/routes/menu.selectors'

export default function AuthenticatedMenuScreen() {
  const router = useRouter()
  const [permissionPayload, setPermissionPayload] = useState<unknown>([])
  const [query, setQuery] = useState('')
  const gridColumns = 4
  const gridItemWidth = '25%' as const

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

  const catalog = useMemo(() => getMobileRouteCatalog(), [])
  const routes = useMemo(() => selectCatalogMenuEntries(catalog, permissionPayload), [catalog, permissionPayload])

  const filteredRoutes = useMemo(() => filterMenuEntries(routes, query), [query, routes])
  const groupedRoutes = useMemo(() => buildMenuGroups(catalog, filteredRoutes), [catalog, filteredRoutes])

  return (
    <View className="gap-7">
      <SearchBox value={query} onChangeText={setQuery} placeholder="Search routes, settings, transactions..." />
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
        groupedRoutes.map((group) => {
          const routeRows = chunkItems(group.entries, gridColumns)

          return (
            <View key={group.moduleSlug} className="gap-3">
              <Text className="text-xl font-bold tracking-[-0.4px]" style={{ color: materialColors.onSurface }}>
                {formatGroupTitle(group.moduleName || group.moduleSlug)}
              </Text>
              <View className="gap-3">
                {routeRows.map((row, rowIndex) => (
                  <View key={`${group.moduleSlug}-${rowIndex}`} className="flex-row">
                    {Array.from({ length: gridColumns }).map((_, columnIndex) => {
                      const route = row[columnIndex]
                      if (!route) {
                        return <View key={`${group.moduleSlug}-${rowIndex}-empty-${columnIndex}`} style={{ width: gridItemWidth }} />
                      }

                      return (
                        <Pressable
                          key={route.key}
                          className="min-h-[112px] items-center justify-start gap-3 px-2 py-1"
                          style={{ width: gridItemWidth }}
                          onPress={() => router.push(route.hrefs.list as any)}
                        >
                          <View
                            className="h-[54px] w-[54px] items-center justify-center rounded-full"
                            style={{ backgroundColor: materialColors.surfaceContainer }}
                          >
                            <Icon
                              name={(route.config.icon || 'apps-2-line') as any}
                              size={24}
                              color={materialColors.primary}
                              fallback={null}
                            />
                          </View>
                          <Text className="text-center text-[15px] font-medium" style={{ color: materialColors.onSurface }}>
                            {route.config.title}
                          </Text>
                          <Text className="text-center text-[11px]" style={{ color: materialColors.onSurfaceVariant }}>
                            {route.config.description || ''}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                ))}
              </View>
            </View>
          )
        })
      )}
    </View>
  )
}
