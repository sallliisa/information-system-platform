import { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { getMobileRouteCatalog, selectCatalogMenuEntries } from '../../../../src/features/routes/catalog.index'
import { buildMenuGroups, filterMenuEntries, formatGroupTitle } from '../../../../src/features/routes/menu.selectors'
import { materialColors } from '../../../../src/theme/material'

export default function MenuScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const catalog = useMemo(() => getMobileRouteCatalog(), [])
  const routes = useMemo(() => selectCatalogMenuEntries(catalog), [catalog])
  const filteredRoutes = useMemo(() => filterMenuEntries(routes, query), [routes, query])
  const groupedRoutes = useMemo(() => buildMenuGroups(catalog, filteredRoutes), [catalog, filteredRoutes])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Search routes..."
        placeholderTextColor={materialColors.onSurfaceVariant}
      />

      {groupedRoutes.length === 0 ? (
        <Card type="filled" color="surfaceContainerLow" style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No routes found</Text>
          <Text style={styles.emptyDescription}>Try another keyword.</Text>
        </Card>
      ) : (
        groupedRoutes.map((group) => (
          <View key={group.moduleSlug} style={styles.group}>
            <Text style={styles.groupTitle}>{formatGroupTitle(group.moduleName || group.moduleSlug)}</Text>
            {group.moduleDescription ? <Text style={styles.groupDescription}>{group.moduleDescription}</Text> : null}

            <View style={styles.entryList}>
              {group.entries.map((entry) => (
                <Pressable key={entry.key} onPress={() => router.push(entry.hrefs.list as any)}>
                  <Card type="filled" color="surfaceContainerLow" style={styles.entryCard}>
                    <Text style={styles.entryTitle}>{entry.config.title}</Text>
                    {entry.config.description ? <Text style={styles.entryDescription}>{entry.config.description}</Text> : null}
                    <Text style={styles.entryPath}>{entry.hrefs.list}</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  searchInput: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: materialColors.onSurface,
  },
  emptyCard: {
    gap: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: materialColors.onSurface,
  },
  emptyDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  groupDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  entryList: {
    gap: 8,
  },
  entryCard: {
    gap: 4,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: materialColors.onSurface,
  },
  entryDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  entryPath: {
    marginTop: 2,
    fontSize: 12,
    color: materialColors.primary,
  },
})
