import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { TextInput } from '../../inputs'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { buildMobileListConfig } from '../../../features/routes/config/defaults.builders'
import { sectionGap } from '../../../theme/layout'
import { materialColors } from '../../../theme/material'
import { DataTable } from '../DataTable'

type CRUDListProps = {
  config: MobileModelConfig
  onCreate: () => void
  onDetail: (id: string | number) => void
  onUpdate: (id: string | number) => void
  showHeading?: boolean
}

export function CRUDList({ config, onCreate, onDetail, onUpdate, showHeading = true }: CRUDListProps) {
  const listConfig = useMemo(() => buildMobileListConfig(config), [config])
  const [search, setSearch] = useState('')

  const searchParameters = useMemo(() => {
    const baseParams = listConfig.searchParameters || {}
    const searchValue = search.trim()
    if (!searchValue) return baseParams
    return { ...baseParams, search: searchValue }
  }, [listConfig.searchParameters, search])

  const uidField = listConfig.uid || 'id'
  const canCreate = config.actions?.create ?? true
  const canDetail = config.actions?.detail ?? true
  const canUpdate = config.actions?.update ?? true

  return (
    <View style={{ gap: sectionGap }}>
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <TextInput
            field="search"
            label=""
            icon='search'
            value={search}
            onChangeValue={setSearch}
            placeholder={`Search ${config.title}...`}
            inputProps={{
              className: 'min-h-11',
            }}
          />
        </View>
        {canCreate ? (
          <Pressable className="min-h-11 rounded-[10px] justify-center px-[14px]" style={{ backgroundColor: materialColors.primary }} onPress={onCreate}>
            <Text className="text-[13px] font-bold" style={{ color: materialColors.onPrimary }}>Create</Text>
          </Pressable>
        ) : null}
      </View>

      {showHeading ? (
        <View className="gap-0.5">
          <Text className="text-2xl font-bold" style={{ color: materialColors.onSurface }}>{config.title}</Text>
          {config.description ? <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>{config.description}</Text> : null}
        </View>
      ) : null}

      <DataTable
        {...listConfig}
        getAPI={listConfig.getAPI || config.name}
        searchParameters={searchParameters}
        onPressRow={(row) => {
          if (!canDetail) return
          const rowID = row[uidField]
          if (rowID === undefined || rowID === null) return
          onDetail(rowID)
        }}
        rowActions={(row) => (
          <View className="flex-row gap-2">
            {canDetail ? (
              <Pressable
                className="rounded-lg px-2.5 py-2"
                style={{ backgroundColor: materialColors.secondaryContainer }}
                onPress={() => {
                  const rowID = row[uidField]
                  if (rowID === undefined || rowID === null) return
                  onDetail(rowID)
                }}
              >
                <Text className="text-xs font-bold" style={{ color: materialColors.onSurface }}>Detail</Text>
              </Pressable>
            ) : null}
            {canUpdate ? (
              <Pressable
                className="rounded-lg px-2.5 py-2"
                style={{ backgroundColor: materialColors.tertiaryContainer }}
                onPress={() => {
                  const rowID = row[uidField]
                  if (rowID === undefined || rowID === null) return
                  onUpdate(rowID)
                }}
              >
                <Text className="text-xs font-bold" style={{ color: materialColors.onSurface }}>Update</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </View>
  )
}
