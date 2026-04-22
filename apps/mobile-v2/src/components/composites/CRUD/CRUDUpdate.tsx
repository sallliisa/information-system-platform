import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { buildFormConfig, type UpdateConfig } from '@repo/model-meta'
import { Form } from '../Form'
import { Icon } from '../../base'
import { materialColors } from '../../../theme/material'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'

type CRUDUpdateProps = {
  config: MobileModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  const updateConfig = useMemo(() => buildFormConfig(config, 'update') as UpdateConfig, [config])

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left-s-line" size={24} color={materialColors.onSurface} />
        </Pressable>
      </View>

      <Text style={styles.title}>Update {config.title}</Text>

      <Form
        formType="update"
        fields={updateConfig.fields || []}
        inputConfig={updateConfig.inputConfig}
        fieldsAlias={updateConfig.fieldsAlias}
        targetAPI={updateConfig.targetAPI || config.name}
        getAPI={updateConfig.getAPI || config.name}
        dataID={dataID}
        searchParameters={updateConfig.searchParameters}
        extraData={updateConfig.extraData}
        getInitialData={updateConfig.getInitialData}
        onSuccess={() => onBack()}
      />
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
})
