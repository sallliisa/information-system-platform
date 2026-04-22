import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { buildFormConfig } from '@repo/model-meta'
import { Form } from '../Form'
import Icon from 'react-native-remix-icon'
import { materialColors } from '@/theme/material'
import { Button } from '../../base'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'

type CRUDCreateProps = {
  config: MobileModelConfig
  onBack: () => void
}

export function CRUDCreate({ config, onBack }: CRUDCreateProps) {
  const createConfig = useMemo(() => buildFormConfig(config, 'create'), [config])

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between" style={{ columnGap: 8 }}>
        <Button variant="outlined" color="secondary" size="square" onPress={onBack}>
          <Icon name="arrow-left-s-line" size={24} color={materialColors.onSurface} fallback={null} />
        </Button>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-text">Tambah {config.title}</Text>
      </View>
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
