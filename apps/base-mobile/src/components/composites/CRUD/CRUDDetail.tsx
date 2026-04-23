import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
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
    <View style={styles.container}>
      <View style={styles.actions}>
        {canUpdate ? (
          <Pressable style={[styles.button, styles.updateButton]} onPress={onUpdate}>
            <Text style={styles.updateLabel}>Update</Text>
          </Pressable>
        ) : null}
      </View>

      <Detail
        {...detailConfig}
        dataID={dataID ?? detailConfig.dataID}
        getAPI={detailConfig.getAPI || config.name}
        onDataLoaded={setDetailData}
      />

      {renderDetailUnderSlot(config, detailData)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: sectionGap,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  updateButton: {
    backgroundColor: materialColors.secondaryContainer,
  },
  updateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: materialColors.onSecondaryContainer,
  },
})
