import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildFormConfig, type ModelConfig, type UpdateConfig } from '@repo/model-meta'
import { Form } from '../Form'
import { Accessory } from '../Accessory'
import { materialColors } from '@/theme/material'
import Icon from 'react-native-remix-icon'

type CRUDUpdateProps = {
  config: ModelConfig
  dataID?: string
  onBack: () => void
}

export function CRUDUpdate({ config, dataID, onBack }: CRUDUpdateProps) {
  const updateConfig = useMemo(() => buildFormConfig(config, 'update') as UpdateConfig, [config])

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
    </>
  )
}
