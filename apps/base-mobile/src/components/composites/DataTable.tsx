import type { ListConfig } from '@repo/model-meta'
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { materialColors } from '../../theme/material'
import { Card } from '../base'

type DataTableProps = ListConfig & {
  data?: Record<string, any>[]
  getData?: (getAPI: string, searchParameters?: Record<string, any>) => Promise<Record<string, any>[]>
  onDataLoaded?: (data: Record<string, any>[]) => void
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
  emptyText?: string
}

const EMPTY_SEARCH_PARAMETERS: Record<string, any> = {}

function normalizeRows(payload: unknown): Record<string, any>[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    return (payload as any).data
  }
  return []
}

async function defaultListGetData(getAPI: string, searchParameters?: Record<string, any>) {
  const response = await api.list(getAPI, searchParameters)
  return normalizeRows(response)
}

export const DataTable = memo(function DataTable({
  data,
  getData = defaultListGetData,
  onDataLoaded,
  getAPI,
  searchParameters,
  fields = [],
  uid = 'id',
  fieldsAlias = {},
  fieldsProxy = {},
  fieldsDictionary = {},
  fieldsParse = {},
  fieldsUnit = {},
  onPressRow,
  rowActions,
  emptyText = 'No data available.',
}: DataTableProps) {
  const onDataLoadedRef = useRef(onDataLoaded)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const resolvedSearchParameters = useMemo(() => searchParameters ?? EMPTY_SEARCH_PARAMETERS, [searchParameters])

  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
  }, [onDataLoaded])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)

      if (data) {
        const nextRows = normalizeRows(data)
        if (!mounted) return
        setRows(nextRows)
        onDataLoadedRef.current?.(nextRows)
        setLoading(false)
        return
      }

      if (!getAPI) {
        if (!mounted) return
        setRows([])
        onDataLoadedRef.current?.([])
        setLoading(false)
        return
      }

      try {
        const fetchedRows = await getData(getAPI, resolvedSearchParameters)
        if (!mounted) return
        const nextRows = normalizeRows(fetchedRows)
        setRows(nextRows)
        onDataLoadedRef.current?.(nextRows)
      } catch {
        if (!mounted) return
        setRows([])
        onDataLoadedRef.current?.([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [data, getAPI, getData, resolvedSearchParameters])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  if (!rows.length) {
    return (
      <Card type="outlined" color="surfaceContainerLow">
        <Text style={styles.emptyText}>{emptyText}</Text>
      </Card>
    )
  }

  return (
    <View style={styles.table}>
      {rows.map((item, index) => (
        <Card
          key={String(item[uid] ?? index)}
          type="outlined"
          color="surface"
          onPress={onPressRow ? () => onPressRow(item) : undefined}
        >
          <View style={styles.rowContent}>
            {fields.map((field) => {
              if (field.startsWith('S|')) return null
              const sourceField = fieldsProxy[field] || field
              const rawValue = item[sourceField]
              const dictionary = fieldsDictionary[field]
              const baseValue =
                dictionary && rawValue !== undefined && rawValue !== null
                  ? dictionary[String(rawValue)] ?? '-'
                  : formatValue(fieldsParse[field], rawValue)
              const value = baseValue === '-' || !fieldsUnit[field] ? baseValue : `${baseValue}${fieldsUnit[field]}`

              return (
                <View key={field} style={styles.fieldRow}>
                  <Text style={styles.fieldKey}>{fieldsAlias[field] || field}</Text>
                  <Text style={styles.fieldValue}>{value}</Text>
                </View>
              )
            })}
            {rowActions ? <View style={styles.actionsSection}>{rowActions(item)}</View> : null}
          </View>
        </Card>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
  table: {
    gap: 10,
  },
  rowContent: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  fieldKey: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: materialColors.onSurfaceVariant,
  },
  fieldValue: {
    flex: 1.2,
    textAlign: 'right',
    fontSize: 14,
    color: materialColors.onSurface,
  },
  actionsSection: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: materialColors.outlineVariant,
  },
})
