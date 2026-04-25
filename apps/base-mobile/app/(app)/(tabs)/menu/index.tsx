import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
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
    <View className="py-1 gap-[18px]">
      {groupedEntries.length === 0 ? (
        <Card className="gap-2" type="filled" color="surfaceContainerLow">
          <Text className="text-lg font-bold" style={{ color: materialColors.onSurface }}>No routes available</Text>
          <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>Catalog entries are empty.</Text>
        </Card>
      ) : (
        groupedEntries.map((group) => (
          <View key={group.moduleSlug} className="gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: materialColors.primaryContainer }}>
                <Icon name={group.moduleIcon || 'folder'} size={18} color={materialColors.primary} />
              </View>
              <Text className="text-xl font-bold" style={{ color: materialColors.onSurface }}>{group.moduleName || group.moduleSlug}</Text>
            </View>
            {group.moduleDescription ? <Text className="text-[13px]" style={{ color: materialColors.onSurfaceVariant }}>{group.moduleDescription}</Text> : null}

            <View className="gap-2.5">
              {group.entries.map((entry) => (
                <Pressable key={entry.key} onPress={() => router.push(entry.hrefs.list as any)}>
                  <Card type="outlined" color="surface" className="gap-1.5">
                    <View className="flex-row items-center gap-2">
                      <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: materialColors.surfaceContainer }}>
                        <Icon name={entry.config.icon || 'apps'} size={16} color={materialColors.primary} />
                      </View>
                      <Text className="text-base font-bold" style={{ color: materialColors.onSurface }}>{entry.config.title}</Text>
                    </View>
                    <Text className="text-[13px]" style={{ color: materialColors.onSurfaceVariant }}>{entry.config.description || 'Open list route'}</Text>
                    <View className="mt-0.5 flex-row justify-between items-center">
                      <Text className="text-xs" style={{ color: materialColors.primary }}>{entry.hrefs.list}</Text>
                      <Icon name="arrow-right" size={16} color={materialColors.onSurfaceVariant} />
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
