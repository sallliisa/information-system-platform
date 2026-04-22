import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildDetailConfig } from '@repo/model-meta'
import { Detail } from '../Detail'
import type { CRUDPermissions } from '../../../hooks/useCrudPermissions'
import { materialColors } from '@/theme/material'
import Icon from 'react-native-remix-icon'
import { Button } from '../../base'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { renderDetailUnderSlot } from '../../../features/routes/detail-slot'

type CRUDDetailProps = {
  config: MobileModelConfig
  permissions: CRUDPermissions
  dataID?: string
  onBack: () => void
  onUpdate: () => void
}

export function CRUDDetail({ config, permissions, dataID, onBack, onUpdate }: CRUDDetailProps) {
  const detailConfig = useMemo(() => buildDetailConfig(config), [config])
  const [detailData, setDetailData] = useState<Record<string, any>>({})

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between" style={{ columnGap: 8 }}>
        <Button variant="outlined" color="secondary" size="square" onPress={onBack}>
          <Icon name="arrow-left-s-line" size={24} color={materialColors.onSurface} fallback={null} />
        </Button>
        {permissions.update && (config.actions?.update ?? true) ? (
          <Pressable
            className="h-[52px] w-[52px] items-center justify-center rounded-full"
            style={{
              backgroundColor: materialColors.secondaryContainer,
              borderColor: materialColors.outlineVariant,
              borderWidth: 1,
            }}
            onPress={onUpdate}
          >
            <Icon name="edit-line" size={24} color={materialColors.onSecondaryContainer} fallback={null} />
          </Pressable>
        ) : null}
      </View>
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
        onDataLoaded={setDetailData}
      />
      {renderDetailUnderSlot(config, detailData)}
    </View>
  )
}
