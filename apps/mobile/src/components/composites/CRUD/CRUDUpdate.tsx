import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { buildFormConfig, type UpdateConfig } from '@repo/model-meta'
import { Form } from '../Form'
import { materialColors } from '@/theme/material'
import Icon from 'react-native-remix-icon'
import { Button } from '../../base'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'

type CRUDUpdateProps = {
  config: MobileModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  const updateConfig = useMemo(() => buildFormConfig(config, 'update') as UpdateConfig, [config])

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between" style={{ columnGap: 8 }}>
        <Button variant="outlined" color="secondary" size="square" onPress={onBack}>
          <Icon name="arrow-left-s-line" size={24} color={materialColors.onSurface} fallback={null} />
        </Button>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-text">Update {config.title}</Text>
      </View>
      <Form
        formType="update"
        fields={updateConfig.fields || []}
        inputConfig={updateConfig.inputConfig}
        fieldsAlias={updateConfig.fieldsAlias}
        targetAPI={updateConfig.targetAPI || config.name}
        getAPI={updateConfig.getAPI || config.name}
        dataID={dataID}
        searchParameters={updateConfig.searchParameters}
        extraData={updateConfig.extraData}
        getInitialData={updateConfig.getInitialData}
        onSuccess={() => onBack()}
      />
    </View>
  )
}
