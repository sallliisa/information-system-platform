import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { getMobileRouteCatalog, selectCatalogMenuEntries } from '../../../../src/features/routes/catalog.index'
import { materialColors } from '../../../../src/theme/material'

export default function MenuScreen() {
  const router = useRouter()
  const catalog = useMemo(() => getMobileRouteCatalog(), [])
  const entries = useMemo(() => selectCatalogMenuEntries(catalog), [catalog])

  const groupedEntries = useMemo(() => {
    const visible = new Set(entries.map((entry) => entry.key))
    return catalog.modules
      .map((moduleGroup) => ({
        moduleSlug: moduleGroup.moduleSlug,
        moduleName: moduleGroup.module.name,
        moduleDescription: moduleGroup.module.description || '',
        entries: moduleGroup.entries.filter((entry) => visible.has(entry.key)),
      }))
      .filter((moduleGroup) => moduleGroup.entries.length > 0)
  }, [catalog, entries])

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.description}>Choose an available route.</Text>
      </View>

      {groupedEntries.length === 0 ? (
        <Card style={styles.emptyCard} type="filled" color="surfaceContainerLow">
          <Text style={styles.emptyTitle}>No routes available</Text>
          <Text style={styles.emptyDescription}>Catalog entries are empty.</Text>
        </Card>
      ) : (
        groupedEntries.map((group) => (
          <View key={group.moduleSlug} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.moduleName || group.moduleSlug}</Text>
            {group.moduleDescription ? <Text style={styles.sectionDescription}>{group.moduleDescription}</Text> : null}

            <View style={styles.cards}>
              {group.entries.map((entry) => (
                <Pressable key={entry.key} onPress={() => router.push(entry.hrefs.list as any)}>
                  <Card type="outlined" color="surface" style={styles.routeCard}>
                    <Text style={styles.routeTitle}>{entry.config.title}</Text>
                    <Text style={styles.routeDescription}>{entry.config.description || 'Open list route'}</Text>
                    <Text style={styles.routePath}>{entry.hrefs.list}</Text>
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 4,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
  emptyCard: {
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  emptyDescription: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  sectionDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  cards: {
    gap: 10,
  },
  routeCard: {
    gap: 6,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  routeDescription: {
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
  routePath: {
    fontSize: 12,
    color: materialColors.primary,
  },
})
