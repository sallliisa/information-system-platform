import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildFormConfig, type ModelConfig, type UpdateConfig } from '@repo/model-meta'
import { Form } from '../Form'

type CRUDUpdateProps = {
  config: ModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  const updateConfig = useMemo(() => buildFormConfig(config, 'update') as UpdateConfig, [config])

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onBack}>
          <Text className="font-semibold text-primary">Kembali</Text>
        </Pressable>
        <Text className="text-base font-semibold text-text">Perbarui {config.title}</Text>
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
