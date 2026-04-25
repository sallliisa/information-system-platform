import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { buildMobileDetailConfig } from '../../../features/routes/config/defaults.builders'
import { renderDetailUnderSlot } from '../../../features/routes/detail-slot'
import { sectionGap } from '../../../theme/layout'
import { materialColors } from '../../../theme/material'
import { Detail } from '../Detail'

type CRUDDetailProps = {
  config: MobileModelConfig
  dataID?: string
  onUpdate: () => void
}

export function CRUDDetail({ config, dataID, onUpdate }: CRUDDetailProps) {
  const detailConfig = useMemo(() => buildMobileDetailConfig(config), [config])
  const [detailData, setDetailData] = useState<Record<string, any>>({})
  const canUpdate = config.actions?.update ?? true

  return (
    <View style={{ gap: sectionGap }}>
      <View className="flex-row justify-end gap-2">
        {canUpdate ? (
          <Pressable className="min-h-11 rounded-[10px] justify-center px-[14px]" style={{ backgroundColor: materialColors.secondaryContainer }} onPress={onUpdate}>
            <Text className="text-[13px] font-bold" style={{ color: materialColors.onSecondaryContainer }}>Update</Text>
          </Pressable>
        ) : null}
      </View>

      <Detail {...detailConfig} dataID={dataID ?? detailConfig.dataID} getAPI={detailConfig.getAPI || config.name} onDataLoaded={setDetailData} />

      {renderDetailUnderSlot(config, detailData)}
    </View>
  )
}
