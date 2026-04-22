import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Card, Icon } from '../../../src/components/base'
import { getMobileRouteCatalog, selectCatalogMenuEntries } from '../../../src/features/routes/catalog.index'
import { buildMenuGroups, filterMenuEntries, formatGroupTitle } from '../../../src/features/routes/menu.selectors'
import { getPermissions } from '../../../src/lib/storage'
import { materialColors, mobileTextInputContentStyle } from '../../../src/theme'

export default function MenuScreen() {
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

  const catalog = useMemo(() => getMobileRouteCatalog(), [])
  const routes = useMemo(() => selectCatalogMenuEntries(catalog, permissionPayload), [catalog, permissionPayload])
  const filteredRoutes = useMemo(() => filterMenuEntries(routes, query), [routes, query])
  const groupedRoutes = useMemo(() => buildMenuGroups(catalog, filteredRoutes), [catalog, filteredRoutes])

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Menu Launcher</Text>
      <TextInput
        style={[mobileTextInputContentStyle, styles.searchInput]}
        value={query}
        onChangeText={setQuery}
        placeholder="Search routes..."
        placeholderTextColor={materialColors.onSurfaceVariant}
        autoCapitalize="none"
      />

      {groupedRoutes.length === 0 ? (
        <Card style={styles.emptyCard} color="surfaceContainerLow">
          <Text style={styles.emptyTitle}>No routes found</Text>
          <Text style={styles.emptyDescription}>Try another keyword or check your permissions.</Text>
        </Card>
      ) : (
        groupedRoutes.map((group) => (
          <View key={group.moduleSlug} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIconBox}>
                <Icon name={group.moduleIcon || 'folder-line'} size={18} color={materialColors.primary} />
              </View>
              <Text style={styles.groupTitle}>{formatGroupTitle(group.moduleName || group.moduleSlug)}</Text>
            </View>
            {group.entries.map((entry) => (
              <Card
                key={entry.key}
                type="outlined"
                color="surface"
                style={styles.routeCard}
                onPress={() => router.push(entry.hrefs.list as any)}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeIconBox}>
                    <Icon name={entry.config.icon || 'apps-line'} size={16} color={materialColors.primary} />
                  </View>
                  <Text style={styles.routeTitle}>{entry.config.title}</Text>
                </View>
                <Text style={styles.routeDescription}>{entry.config.description || ''}</Text>
                <View style={styles.routeFooter}>
                  <Text style={styles.routePath}>{entry.hrefs.list}</Text>
                  <Icon name="arrow-right-line" size={16} color={materialColors.onSurfaceVariant} />
                </View>
              </Card>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    borderRadius: 12,
    backgroundColor: materialColors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: materialColors.onSurface,
  },
  emptyCard: {
    borderRadius: 14,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  emptyDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  groupContainer: {
    gap: 8,
    marginTop: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupIconBox: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.primaryContainer,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  routeCard: {
    borderRadius: 14,
    gap: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeIconBox: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.surfaceContainer,
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  routeDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  routeFooter: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routePath: {
    fontSize: 12,
    color: materialColors.primary,
  },
})
