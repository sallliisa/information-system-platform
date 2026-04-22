import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { Card } from '../../base'
import { materialColors } from '../../../theme/material'

type CRUDUpdateProps = {
  config: MobileModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonLabel}>Back</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Update {config.title}</Text>

      <Card style={styles.card} type="outlined">
        <Text style={styles.bodyText}>Target record ID: {dataID || '-'}</Text>
        <Text style={styles.bodyText}>Update form is intentionally dummy in this phase.</Text>
        <Pressable style={styles.primaryButton} onPress={onBack}>
          <Text style={styles.primaryButtonLabel}>Done</Text>
        </Pressable>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topActions: {
    flexDirection: 'row',
  },
  backButton: {
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainer,
  },
  backButtonLabel: {
    color: materialColors.onSurface,
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  card: {
    gap: 10,
  },
  bodyText: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: materialColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: materialColors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
})
