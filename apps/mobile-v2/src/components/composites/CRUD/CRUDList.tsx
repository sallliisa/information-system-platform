import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { buildListConfig } from '@repo/model-meta'
import { api } from '../../../lib/api'
import { materialColors } from '../../../theme/material'
import { mobileTextInputContentStyle } from '../../../theme/textInput'
import { Icon } from '../../base'
import { DataTable } from '../DataTable'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import type { CRUDPermissions } from '../../../hooks/useCrudPermissions'

type CRUDListProps = {
  config: MobileModelConfig
  permissions: CRUDPermissions
  onCreate: () => void
  onDetail: (id: string | number) => void
  onUpdate: (id: string | number) => void
}

export function CRUDList({ config, permissions, onCreate, onDetail, onUpdate }: CRUDListProps) {
  const listConfig = useMemo(() => buildListConfig(config), [config])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Record<string, any>[]>([])
  const [search, setSearch] = useState('')

  const canCreate = permissions.create && (config.actions?.create ?? true)
  const canDetail = permissions.detail && (config.actions?.detail ?? true)
  const canUpdate = permissions.update && (config.actions?.update ?? true)

  const requestParams = useMemo(() => {
    const baseParams = listConfig.searchParameters || {}
    return {
      ...baseParams,
      ...(search.trim() ? { search: search.trim() } : null),
    }
  }, [listConfig.searchParameters, search])

  const loadData = useCallback(async () => {
    if (!listConfig.getAPI) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await api.list(listConfig.getAPI, requestParams)
      const rows = response?.data ?? response
      setData(Array.isArray(rows) ? rows : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [listConfig.getAPI, requestParams])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const keyField = listConfig.uid || 'id'

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchWrap}>
          <Icon name="search-line" size={18} color={materialColors.onSurfaceVariant} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${config.title}...`}
            placeholderTextColor={materialColors.onSurfaceVariant}
            style={[mobileTextInputContentStyle, styles.searchInput]}
          />
        </View>
        {canCreate ? (
          <Pressable style={styles.createButton} onPress={onCreate}>
            <Icon name="add-line" size={20} color={materialColors.onPrimary} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{config.title}</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
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
          onPressRow={
            canDetail
              ? (row) => {
                  const rowID = row[keyField]
                  if (rowID === undefined || rowID === null) return
                  onDetail(rowID)
                }
              : undefined
          }
          rowActions={(row) => {
            const rowID = row[keyField]
            if (rowID === undefined || rowID === null) return null
            if (!canDetail && !canUpdate) return null

            return (
              <View style={styles.rowActions}>
                {canDetail ? (
                  <Pressable style={[styles.actionButton, styles.detailAction]} onPress={() => onDetail(rowID)}>
                    <Text style={[styles.actionLabel, styles.detailActionLabel]}>Detail</Text>
                  </Pressable>
                ) : null}
                {canUpdate ? (
                  <Pressable style={[styles.actionButton, styles.updateAction]} onPress={() => onUpdate(rowID)}>
                    <Text style={[styles.actionLabel, styles.updateActionLabel]}>Update</Text>
                  </Pressable>
                ) : null}
              </View>
            )
          }}
          emptyText={`No ${config.title} data`}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainerLow,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: materialColors.onSurface,
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailAction: {
    backgroundColor: materialColors.primaryContainer,
  },
  updateAction: {
    backgroundColor: materialColors.secondaryContainer,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailActionLabel: {
    color: materialColors.onPrimaryContainer,
  },
  updateActionLabel: {
    color: materialColors.onSecondaryContainer,
  },
})
