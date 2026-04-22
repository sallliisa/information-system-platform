import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { renderDetailUnderSlot } from '../../../features/routes/detail-slot'
import { Card } from '../../base'
import { materialColors } from '../../../theme/material'

type CRUDDetailProps = {
  config: MobileModelConfig
  dataID?: string
  onBack: () => void
  onUpdate: () => void
}

export function CRUDDetail({ config, dataID, onBack, onUpdate }: CRUDDetailProps) {
  const detailData = useMemo(
    () => ({
      id: dataID,
      model: config.name,
      title: config.title,
      loaded: false,
    }),
    [config.name, config.title, dataID]
  )

  const canUpdate = config.actions?.update ?? true

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Pressable style={[styles.button, styles.backButton]} onPress={onBack}>
          <Text style={styles.backButtonLabel}>Back</Text>
        </Pressable>
        {canUpdate ? (
          <Pressable style={[styles.button, styles.updateButton]} onPress={onUpdate}>
            <Text style={styles.updateButtonLabel}>Update</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>Detail {config.title}</Text>

      <Card style={styles.card} type="outlined">
        <Text style={styles.cardLabel}>ID</Text>
        <Text style={styles.cardValue}>{dataID || '-'}</Text>
        <Text style={styles.helperText}>Detail and form implementations are intentionally dummy in this phase.</Text>
      </Card>

      {renderDetailUnderSlot(config, detailData)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainer,
  },
  backButtonLabel: {
    color: materialColors.onSurface,
    fontWeight: '600',
    fontSize: 13,
  },
  updateButton: {
    backgroundColor: materialColors.secondaryContainer,
  },
  updateButtonLabel: {
    color: materialColors.onSecondaryContainer,
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  card: {
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: materialColors.onSurfaceVariant,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: materialColors.onSurface,
  },
  helperText: {
    marginTop: 2,
    fontSize: 13,
    color: materialColors.onSurfaceVariant,
  },
})
