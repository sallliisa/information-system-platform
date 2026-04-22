import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { buildFormConfig } from '@repo/model-meta'
import { Form } from '../Form'
import { Icon } from '../../base'
import { materialColors } from '../../../theme/material'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'

type CRUDCreateProps = {
  config: MobileModelConfig
  onBack: () => void
}

export function CRUDCreate({ config, onBack }: CRUDCreateProps) {
  const createConfig = useMemo(() => buildFormConfig(config, 'create'), [config])

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-left-s-line" size={24} color={materialColors.onSurface} />
        </Pressable>
      </View>

      <Text style={styles.title}>Create {config.title}</Text>

      <Form
        formType="create"
        fields={createConfig.fields || []}
        inputConfig={createConfig.inputConfig}
        fieldsAlias={createConfig.fieldsAlias}
        targetAPI={createConfig.targetAPI || config.name}
        extraData={createConfig.extraData}
        getInitialData={createConfig.getInitialData}
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
