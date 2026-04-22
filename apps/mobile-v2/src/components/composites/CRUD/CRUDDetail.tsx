import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { buildDetailConfig } from '@repo/model-meta'
import { Detail } from '../Detail'
import { Icon } from '../../base'
import { materialColors } from '../../../theme/material'
import { renderDetailUnderSlot } from '../../../features/routes/detail-slot'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import type { CRUDPermissions } from '../../../hooks/useCrudPermissions'

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
  const canUpdate = permissions.update && (config.actions?.update ?? true)

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left-s-line" size={24} color={materialColors.onSurface} />
        </Pressable>
        {canUpdate ? (
          <Pressable style={styles.updateButton} onPress={onUpdate}>
            <Icon name="edit-line" size={22} color={materialColors.onSecondaryContainer} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>Detail {config.title}</Text>

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

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
  },
  updateButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.secondaryContainer,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
})
