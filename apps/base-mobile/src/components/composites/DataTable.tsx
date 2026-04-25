import type { ListConfig } from '@repo/model-meta'
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
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
      <View className="items-center justify-center py-7">
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  if (!rows.length) {
    return (
      <Card type="outlined" color="surfaceContainerLow">
        <Text className="text-center text-sm" style={{ color: materialColors.onSurfaceVariant }}>{emptyText}</Text>
      </Card>
    )
  }

  return (
    <View className="gap-2.5">
      {rows.map((item, index) => (
        <Card key={String(item[uid] ?? index)} type="outlined" color="surface" onPress={onPressRow ? () => onPressRow(item) : undefined}>
          <View className="gap-2">
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
                <View key={field} className="flex-row gap-3 items-start justify-between">
                  <Text className="flex-1 text-[11px] font-bold uppercase" style={{ color: materialColors.onSurfaceVariant }}>{fieldsAlias[field] || field}</Text>
                  <Text className="flex-[1.2] text-right text-sm" style={{ color: materialColors.onSurface }}>{value}</Text>
                </View>
              )
            })}
            {rowActions ? (
              <View className="mt-1 pt-2.5 border-t" style={{ borderTopColor: materialColors.outlineVariant }}>
                {rowActions(item)}
              </View>
            ) : null}
          </View>
        </Card>
      ))}
    </View>
  )
})
