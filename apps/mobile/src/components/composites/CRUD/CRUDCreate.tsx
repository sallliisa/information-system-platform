import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildFormConfig, type ModelConfig } from '@repo/model-meta'
import { Form } from '../Form'
import { Accessory } from '../Accessory'
import Icon from 'react-native-remix-icon'
import { materialColors } from '@/theme/material'

type CRUDCreateProps = {
  config: ModelConfig
  onBack: () => void
}

export function CRUDCreate({ config, onBack }: CRUDCreateProps) {
  const createConfig = useMemo(() => buildFormConfig(config, 'create'), [config])

  return (
    <>
      <Accessory>
        <View className="flex-row items-center justify-between" style={{ columnGap: 8 }}>
          <Pressable
              className="h-[52px] w-[52px] items-center justify-center rounded-full"
              style={{ 
                backgroundColor: materialColors.surfaceContainer, 
                borderColor: materialColors.outlineVariant,
                borderWidth: 1
              }}
              onPress={onBack}
            >
              <Icon name='arrow-left-s-line' size={24} color={materialColors.onSurface} fallback={null} />
            </Pressable>
        </View>
      </Accessory>
      <View className="gap-3">
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
    </>
  )
}
