import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { materialColors } from '../../../theme/material'
import { Card } from '../../base'

type CRUDUpdateProps = {
  config: MobileModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <Card type="outlined" color="surface">
        <View style={styles.content}>
          <Text style={styles.title}>Update {config.title}</Text>
          <Text style={styles.description}>Dummy form component for now.</Text>
          <Text style={styles.meta}>Record ID: {dataID || '-'}</Text>
          <Pressable style={styles.submitButton}>
            <Text style={styles.submitLabel}>Save (Dummy)</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: materialColors.surfaceContainer,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  content: {
    gap: 10,
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
  submitButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: materialColors.primary,
  },
  submitLabel: {
    color: materialColors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
})
