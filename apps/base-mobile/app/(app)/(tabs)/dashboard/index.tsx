import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { materialColors } from '../../../../src/theme/material'

export default function DashboardScreen() {
  const router = useRouter()

  return (
    <View style={styles.center}>
      <Card style={styles.card} type="filled" color="surfaceContainerLow">
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.description}>Phase 1 dummy dashboard tab.</Text>

        <Pressable style={styles.button} onPress={() => router.push('/dashboard/details' as any)}>
          <Text style={styles.buttonLabel}>Open Details (Push)</Text>
        </Pressable>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 15,
    color: materialColors.onSurfaceVariant,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: materialColors.primary,
  },
  buttonLabel: {
    color: materialColors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
})
