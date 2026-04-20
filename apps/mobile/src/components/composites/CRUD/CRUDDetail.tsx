import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildDetailConfig, type ModelConfig } from '@repo/model-meta'
import { Detail } from '../Detail'
import type { CRUDPermissions } from '../../../hooks/useCrudPermissions'
import { Accessory } from '../Accessory'
import { materialColors } from '@/theme/material'
import Icon from 'react-native-remix-icon'

type CRUDDetailProps = {
  config: ModelConfig
  permissions: CRUDPermissions
  dataID?: string
  onBack: () => void
  onUpdate: () => void
}

export function CRUDDetail({ config, permissions, dataID, onBack, onUpdate }: CRUDDetailProps) {
  const detailConfig = useMemo(() => buildDetailConfig(config), [config])

  return (
    <>
      <Accessory>
        <View className="flex-row items-center justify-between" style={{ columnGap: 8 }}>
          <Pressable
              className="h-[52px] w-[52px] items-center justify-center rounded-full"
              style={{ 
                backgroundColor: materialColors.surfaceContainer, 
                borderColor: materialColors.outlineVariant,
                borderWidth: 1
              }}
              onPress={onBack}
            >
              <Icon name='arrow-left-s-line' size={24} color={materialColors.onSurface} fallback={null} />
            </Pressable>
            {permissions.update && (config.actions?.update ?? true) ? (
              <Pressable
                className="h-[52px] w-[52px] items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: materialColors.secondaryContainer, 
                  borderColor: materialColors.outlineVariant,
                  borderWidth: 1
                }}
                onPress={onUpdate}
              >
                <Icon name='edit-line' size={24} color={materialColors.onSecondaryContainer} fallback={null} />
              </Pressable>
            ) : null}
        </View>
      </Accessory>
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text">Detail {config.title}</Text>
        </View>
        <Detail
          getAPI={detailConfig.getAPI || config.name}
          dataID={dataID}
          fields={detailConfig.fields || []}
          fieldsAlias={detailConfig.fieldsAlias}
          fieldsDictionary={detailConfig.fieldsDictionary}
          fieldsParse={detailConfig.fieldsParse}
          fieldsProxy={detailConfig.fieldsProxy}
          searchParameters={detailConfig.searchParameters}
        />
      </View>
    </>
  )
}
