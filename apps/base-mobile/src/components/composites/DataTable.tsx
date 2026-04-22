import { memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { Card } from '../base'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { materialColors } from '../../theme/material'

type DataTableProps = {
  getAPI: string
  requestParams?: Record<string, any>
  fields: string[]
  keyField?: string
  fieldsAlias?: Record<string, string>
  fieldsProxy?: Record<string, string>
  fieldsDictionary?: Record<string, Record<string, string>>
  fieldsParse?: Record<string, string>
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
  emptyText?: string
  contentContainerStyle?: StyleProp<ViewStyle>
}

function extractErrorMessage(error: unknown): string {
  const candidate = error as { message?: unknown; error?: unknown; statusText?: unknown }

  if (candidate?.message && typeof candidate.message === 'object') {
    const nested = candidate.message as { message?: unknown }
    if (nested.message) return String(nested.message)
  }

  return String(candidate?.message || candidate?.error || candidate?.statusText || 'Failed to load data.')
}

function normalizeRows(payload: any): Record<string, any>[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const DataTable = memo(function DataTable({
  getAPI,
  requestParams,
  fields,
  keyField = 'id',
  fieldsAlias = {},
  fieldsProxy = {},
  fieldsDictionary = {},
  fieldsParse = {},
  onPressRow,
  rowActions,
  emptyText = 'No data available',
  contentContainerStyle,
}: DataTableProps) {
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState<Record<string, any>[]>([])

  const queryKey = useMemo(() => JSON.stringify(requestParams || {}), [requestParams])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setErrorMessage('')

      try {
        const response = await api.list(getAPI, requestParams)
        if (!mounted) return
        setData(normalizeRows(response))
      } catch (error) {
        if (!mounted) return
        setData([])
        setErrorMessage(extractErrorMessage(error))
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [getAPI, queryKey, requestParams])

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  if (errorMessage) {
    return (
      <Card type="filled" color="errorContainer">
        <Text style={styles.errorText}>{errorMessage}</Text>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </Card>
    )
  }

  return (
    <View style={[styles.table, contentContainerStyle]}>
      {data.map((item, index) => {
        const row = (
          <Card key={String(item[keyField] ?? index)} type="outlined">
            <View style={styles.rowContent}>
              {fields.map((field) => {
                const sourceField = fieldsProxy[field] || field
                const rawValue = item[sourceField]
                const dictionary = fieldsDictionary[field]
                const value =
                  dictionary && rawValue !== undefined && rawValue !== null
                    ? dictionary[String(rawValue)] ?? '-'
                    : formatValue(fieldsParse[field], rawValue)

                return (
                  <View key={field} style={styles.kvRow}>
                    <Text style={styles.kvLabel}>{fieldsAlias[field] || field}</Text>
                    <Text style={styles.kvValue}>{value}</Text>
                  </View>
                )
              })}
              {rowActions ? <View style={styles.actionsContainer}>{rowActions(item)}</View> : null}
            </View>
          </Card>
        )

        if (!onPressRow) {
          return row
        }

        return (
          <Pressable key={String(item[keyField] ?? index)} onPress={() => onPressRow(item)}>
            {row}
          </Pressable>
        )
      })}
    </View>
  )
})

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  table: {
    gap: 10,
  },
  rowContent: {
    gap: 8,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  kvLabel: {
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
    fontWeight: '600',
    color: materialColors.onSurfaceVariant,
  },
  kvValue: {
    flex: 1.2,
    textAlign: 'right',
    fontSize: 14,
    color: materialColors.onSurface,
  },
  actionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: materialColors.outlineVariant,
  },
  emptyText: {
    textAlign: 'center',
    color: materialColors.onSurfaceVariant,
  },
  errorText: {
    color: materialColors.onErrorContainer,
    fontSize: 13,
  },
})
