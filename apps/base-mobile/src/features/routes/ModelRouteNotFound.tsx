import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../components/base'
import { materialColors } from '../../theme/material'

type ModelRouteNotFoundProps = {
  moduleSlug?: string
  modelSlug?: string
}

export function ModelRouteNotFound({ moduleSlug, modelSlug }: ModelRouteNotFoundProps) {
  return (
    <View style={styles.container}>
      <Card type="filled" color="surfaceContainerLow" style={styles.card}>
        <Text style={styles.title}>Route not found</Text>
        <Text style={styles.description}>
          {moduleSlug && modelSlug
            ? `No CRUD configuration found for ${moduleSlug}/${modelSlug}.`
            : 'Module and model parameters are required.'}
        </Text>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
})
