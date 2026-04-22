import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { buildListConfig } from '@repo/model-meta'
import type { MobileModelConfig } from '../../../features/routes/catalog.types'
import { materialColors } from '../../../theme/material'
import { DataTable } from '../DataTable'

type CRUDListProps = {
  config: MobileModelConfig
  onCreate: () => void
  onDetail: (id: string | number) => void
  onUpdate: (id: string | number) => void
}

export function CRUDList({ config, onCreate, onDetail, onUpdate }: CRUDListProps) {
  const listConfig = useMemo(() => buildListConfig(config), [config])
  const [search, setSearch] = useState('')

  const requestParams = useMemo(() => {
    const baseParams = listConfig.searchParameters || {}
    return { ...baseParams, search }
  }, [listConfig.searchParameters, search])

  const keyField = listConfig.uid || 'id'
  const canCreate = config.actions?.create ?? true
  const canDetail = config.actions?.detail ?? true
  const canUpdate = config.actions?.update ?? true

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={`Search ${config.title}...`}
          placeholderTextColor={materialColors.onSurfaceVariant}
        />
        {canCreate ? (
          <Pressable style={styles.createButton} onPress={onCreate}>
            <Text style={styles.createButtonLabel}>Create</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{config.title}</Text>

      <DataTable
        getAPI={listConfig.getAPI || config.name}
        requestParams={requestParams}
        fields={listConfig.fields || []}
        keyField={keyField}
        fieldsAlias={listConfig.fieldsAlias}
        fieldsDictionary={listConfig.fieldsDictionary}
        fieldsParse={listConfig.fieldsParse}
        fieldsProxy={listConfig.fieldsProxy}
        onPressRow={
          canDetail
            ? (row) => {
                const id = row[keyField]
                if (id !== undefined && id !== null) {
                  onDetail(id)
                }
              }
            : undefined
        }
        rowActions={(row) => {
          const id = row[keyField]
          if (id === undefined || id === null) return null

          return (
            <View style={styles.actionsRow}>
              {canDetail ? (
                <Pressable style={[styles.actionButton, styles.detailButton]} onPress={() => onDetail(id)}>
                  <Text style={styles.actionButtonLabel}>Detail</Text>
                </Pressable>
              ) : null}
              {canUpdate ? (
                <Pressable style={[styles.actionButton, styles.updateButton]} onPress={() => onUpdate(id)}>
                  <Text style={styles.actionButtonLabel}>Update</Text>
                </Pressable>
              ) : null}
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: materialColors.onSurface,
  },
  createButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: materialColors.primary,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonLabel: {
    color: materialColors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailButton: {
    backgroundColor: materialColors.primaryContainer,
  },
  updateButton: {
    backgroundColor: materialColors.secondaryContainer,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: materialColors.onSurface,
  },
})
