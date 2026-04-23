import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card, Icon } from '../../../../src/components/base'
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
        moduleIcon: moduleGroup.module.icon,
        moduleDescription: moduleGroup.module.description || '',
        entries: moduleGroup.entries.filter((entry) => visible.has(entry.key)),
      }))
      .filter((moduleGroup) => moduleGroup.entries.length > 0)
  }, [catalog, entries])

  return (
    <View style={styles.content}>
      {groupedEntries.length === 0 ? (
        <Card style={styles.emptyCard} type="filled" color="surfaceContainerLow">
          <Text style={styles.emptyTitle}>No routes available</Text>
          <Text style={styles.emptyDescription}>Catalog entries are empty.</Text>
        </Card>
      ) : (
        groupedEntries.map((group) => (
          <View key={group.moduleSlug} style={styles.section}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIconBox}>
                <Icon name={group.moduleIcon || 'folder-line'} size={18} color={materialColors.primary} />
              </View>
              <Text style={styles.sectionTitle}>{group.moduleName || group.moduleSlug}</Text>
            </View>
            {group.moduleDescription ? <Text style={styles.sectionDescription}>{group.moduleDescription}</Text> : null}

            <View style={styles.cards}>
              {group.entries.map((entry) => (
                <Pressable key={entry.key} onPress={() => router.push(entry.hrefs.list as any)}>
                  <Card type="outlined" color="surface" style={styles.routeCard}>
                    <View style={styles.routeHeader}>
                      <View style={styles.routeIconBox}>
                        <Icon name={entry.config.icon || 'apps-line'} size={16} color={materialColors.primary} />
                      </View>
                      <Text style={styles.routeTitle}>{entry.config.title}</Text>
                    </View>
                    <Text style={styles.routeDescription}>{entry.config.description || 'Open list route'}</Text>
                    <View style={styles.routeFooter}>
                      <Text style={styles.routePath}>{entry.hrefs.list}</Text>
                      <Icon name="arrow-right-line" size={16} color={materialColors.onSurfaceVariant} />
                    </View>
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
  content: {
    paddingVertical: 4,
    gap: 18,
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
  routeFooter: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
