import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { renderDetailUnderSlot } from '../../../features/routes/detail-slot'
import { materialColors } from '../../../theme/material'
import { Card } from '../../base'

type CRUDDetailProps = {
  config: MobileModelConfig
  moduleSlug: string
  modelSlug: string
  dataID?: string
  onBack: () => void
  onUpdate: () => void
}

export function CRUDDetail({ config, moduleSlug, modelSlug, dataID, onBack, onUpdate }: CRUDDetailProps) {
  const placeholderData = useMemo(
    () => ({
      id: dataID || '',
      moduleSlug,
      modelSlug,
      modelName: config.name,
      title: config.title,
    }),
    [config.name, config.title, dataID, modelSlug, moduleSlug]
  )

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.backButton]} onPress={onBack}>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.updateButton]} onPress={onUpdate}>
          <Text style={styles.updateLabel}>Update</Text>
        </Pressable>
      </View>

      <Card type="outlined" color="surface">
        <View style={styles.content}>
          <Text style={styles.title}>Detail {config.title}</Text>
          <Text style={styles.description}>Dummy detail component for now.</Text>
          <Text style={styles.meta}>ID: {dataID || '-'}</Text>
          <Text style={styles.meta}>Module: {moduleSlug}</Text>
          <Text style={styles.meta}>Model: {modelSlug}</Text>
        </View>
      </Card>

      {renderDetailUnderSlot(config, placeholderData)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  backButton: {
    backgroundColor: materialColors.surfaceContainer,
  },
  updateButton: {
    backgroundColor: materialColors.secondaryContainer,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  updateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: materialColors.onSecondaryContainer,
  },
  content: {
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
  meta: {
    fontSize: 13,
    color: materialColors.onSurface,
  },
})
