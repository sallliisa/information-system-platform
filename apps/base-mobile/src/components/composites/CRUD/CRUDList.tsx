import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
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
    <View style={styles.container}>
      <View style={styles.toolbar}>
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

      {showHeading ? (
        <View style={styles.heading}>
          <Text style={styles.title}>{config.title}</Text>
          {config.description ? <Text style={styles.description}>{config.description}</Text> : null}
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
          <View style={styles.actionsRow}>
            {canDetail ? (
              <Pressable
                style={[styles.actionButton, styles.detailButton]}
                onPress={() => {
                  const rowID = row[uidField]
                  if (rowID === undefined || rowID === null) return
                  onDetail(rowID)
                }}
              >
                <Text style={styles.actionLabel}>Detail</Text>
              </Pressable>
            ) : null}
            {canUpdate ? (
              <Pressable
                style={[styles.actionButton, styles.updateButton]}
                onPress={() => {
                  const rowID = row[uidField]
                  if (rowID === undefined || rowID === null) return
                  onUpdate(rowID)
                }}
              >
                <Text style={styles.actionLabel}>Update</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: sectionGap,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainerLowest,
    paddingHorizontal: 12,
    color: materialColors.onSurface,
  },
  createButton: {
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: materialColors.primary,
  },
  createButtonLabel: {
    color: materialColors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  heading: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
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
    backgroundColor: materialColors.secondaryContainer,
  },
  updateButton: {
    backgroundColor: materialColors.tertiaryContainer,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
})
