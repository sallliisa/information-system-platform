import { Text, View } from 'react-native'
import { materialColors } from '../../theme/material'

type ModelRouteNotFoundProps = {
  moduleSlug?: string
  modelSlug?: string
}

export function ModelRouteNotFound({ moduleSlug, modelSlug }: ModelRouteNotFoundProps) {
  return (
    <View
      className="mt-3 gap-1.5 rounded-2xl px-4 py-5"
      style={{ backgroundColor: materialColors.surfaceContainerLow }}
    >
      <Text className="text-base font-semibold" style={{ color: materialColors.onSurface }}>
        Route not found
      </Text>
      <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>
        {moduleSlug && modelSlug
          ? `No CRUD configuration found for ${moduleSlug}/${modelSlug}.`
          : 'Module and model parameters are required.'}
      </Text>
    </View>
  )
}
