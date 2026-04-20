import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildFormConfig, type ModelConfig } from '@repo/model-meta'
import { Form } from '../Form'

type CRUDCreateProps = {
  config: ModelConfig
  onBack: () => void
}

export function CRUDCreate({ config, onBack }: CRUDCreateProps) {
  const createConfig = useMemo(() => buildFormConfig(config, 'create'), [config])

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onBack}>
          <Text className="font-semibold text-primary">Kembali</Text>
        </Pressable>
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
