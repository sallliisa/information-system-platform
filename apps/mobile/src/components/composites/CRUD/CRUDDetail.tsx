import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { buildDetailConfig, type ModelConfig } from '@repo/model-meta'
import { Detail } from '../Detail'
import type { CRUDPermissions } from '../../../hooks/useCrudPermissions'

type CRUDDetailProps = {
  config: ModelConfig
  permissions: CRUDPermissions
  dataID?: string
  onBack: () => void
  onUpdate: () => void
}

export function CRUDDetail({ config, permissions, dataID, onBack, onUpdate }: CRUDDetailProps) {
  const detailConfig = useMemo(() => buildDetailConfig(config), [config])

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onBack}>
          <Text className="font-semibold text-primary">Kembali</Text>
        </Pressable>
        {permissions.update && (config.actions?.update ?? true) ? (
          <Pressable className="rounded-md bg-amber-500 px-3 py-2" onPress={onUpdate}>
            <Text className="text-xs font-semibold text-white">Update</Text>
          </Pressable>
        ) : null}
      </View>
      <Detail
        getAPI={detailConfig.getAPI || config.name}
        dataID={dataID}
        fields={detailConfig.fields || []}
        fieldsAlias={detailConfig.fieldsAlias}
        fieldsDictionary={detailConfig.fieldsDictionary}
        fieldsParse={detailConfig.fieldsParse}
        fieldsProxy={detailConfig.fieldsProxy}
        searchParameters={detailConfig.searchParameters}
      />
    </View>
  )
}
