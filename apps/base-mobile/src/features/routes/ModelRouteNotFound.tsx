import { Text, View } from 'react-native'
import { Card } from '../../components/base'
import { materialColors } from '../../theme/material'

type ModelRouteNotFoundProps = {
  moduleSlug?: string
  modelSlug?: string
}

export function ModelRouteNotFound({ moduleSlug, modelSlug }: ModelRouteNotFoundProps) {
  const description =
    moduleSlug && modelSlug
      ? `No CRUD configuration found for ${moduleSlug}/${modelSlug}.`
      : 'Module and model route parameters are required.'

  return (
    <View className="flex-1 justify-center">
      <Card type="filled" color="surfaceContainerLow" className="gap-2">
        <Text className="text-lg font-bold" style={{ color: materialColors.onSurface }}>Route not found</Text>
        <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>{description}</Text>
      </Card>
    </View>
  )
}
