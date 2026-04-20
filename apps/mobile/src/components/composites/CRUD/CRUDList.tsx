import Icon from 'react-native-remix-icon'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { buildListConfig, type ModelConfig } from '@repo/model-meta'
import { api } from '../../../lib/api'
import { DataTable } from '../DataTable'
import type { CRUDPermissions } from '../../../hooks/useCrudPermissions'
import { useRegisterBottomAccessory } from '../../../hooks/useBottomOffset'
import { materialColors } from '../../../theme/material'
import { SearchBox } from '..'

type CRUDListProps = {
  config: ModelConfig
  permissions: CRUDPermissions
  onCreate: () => void
  onDetail: (id: string | number) => void
  onUpdate: (id: string | number) => void
}

export function CRUDList({ config, permissions, onCreate, onDetail, onUpdate }: CRUDListProps) {
  const listConfig = useMemo(() => buildListConfig(config), [config])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Record<string, any>[]>([])
  const searchInputRef = useRef<TextInput>(null)
  const [search, setSearch] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const canCreate = permissions.create && (config.actions?.create ?? true)

  const requestParams = useMemo(() => {
    const baseParams = listConfig.searchParameters || {}
    return { ...baseParams, search }
  }, [listConfig.searchParameters, search])

  const loadData = useCallback(async () => {
    if (!listConfig.getAPI) return
    setLoading(true)
    try {
      const response = await api.list(listConfig.getAPI, requestParams)
      setData(response?.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [listConfig.getAPI, requestParams])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const keyField = listConfig.uid || 'id'

  const searchBarAccessory = useMemo(() => {
    return (
      <View className="flex-row items-center" style={{ columnGap: 8 }}>
        <SearchBox
          ref={searchInputRef}
          className="flex-1"
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${config.title}...`}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />

        {canCreate && !isSearchFocused ? (
          <Pressable
            className="h-[52px] w-[52px] items-center justify-center rounded-full"
            style={{ backgroundColor: materialColors.primary }}
            onPress={onCreate}
          >
            <Icon name="add-line" size={24} color={materialColors.onPrimary} fallback={null} />
          </Pressable>
        ) : null}
      </View>
    )
  }, [canCreate, config.title, isSearchFocused, onCreate, search])

  useRegisterBottomAccessory({
    height: 52,
    gapFromNavbar: 10,
    element: searchBarAccessory,
  })

  return (
    <View className="gap-3">
      <View className="flex-row items-center">
        <Text className="text-xl font-semibold text-text">{config.title}</Text>
      </View>

      {loading ? (
        <View className="items-center py-10">
          <ActivityIndicator />
        </View>
      ) : (
        <DataTable
          fields={listConfig.fields || []}
          data={data}
          keyField={keyField}
          fieldsAlias={listConfig.fieldsAlias}
          fieldsDictionary={listConfig.fieldsDictionary}
          fieldsParse={listConfig.fieldsParse}
          fieldsProxy={listConfig.fieldsProxy}
          onPressRow={(row) => onDetail(row[keyField])}
          rowActions={(row) => (
            <View className="flex-row gap-2">
              {permissions.detail && (config.actions?.detail ?? true) ? (
                <Pressable className="rounded-md bg-sky-600 px-3 py-2" onPress={() => onDetail(row[keyField])}>
                  <Text className="text-xs font-semibold text-white">Detail</Text>
                </Pressable>
              ) : null}
              {permissions.update && (config.actions?.update ?? true) ? (
                <Pressable className="rounded-md bg-amber-500 px-3 py-2" onPress={() => onUpdate(row[keyField])}>
                  <Text className="text-xs font-semibold text-white">Update</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  )
}
