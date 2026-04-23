import { memo, useCallback, useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { materialColors } from '../../theme/material'
import { Card } from '../base'

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
  emptyText = 'No data available.',
}: DataTableProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Record<string, any>[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.list(getAPI, requestParams)
      const nextRows = Array.isArray(response) ? response : (response?.data ?? [])
      setRows(Array.isArray(nextRows) ? nextRows : [])
    } catch (err: any) {
      const message = String(err?.message || err?.error || err?.statusText || 'Failed to load data.')
      setError(message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [getAPI, requestParams])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <Card type="filled" color="errorContainer" style={styles.feedbackCard}>
        <Text style={styles.errorTitle}>Could not load table data.</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => void loadData()}>
          <Text style={styles.retryLabel}>Try Again</Text>
        </Pressable>
      </Card>
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
          key={String(item[keyField] ?? index)}
          type="outlined"
          color="surface"
          onPress={onPressRow ? () => onPressRow(item) : undefined}
        >
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
  feedbackCard: {
    gap: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: materialColors.onErrorContainer,
  },
  errorText: {
    fontSize: 13,
    color: materialColors.onErrorContainer,
  },
  retryButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: materialColors.error,
  },
  retryLabel: {
    color: materialColors.onError,
    fontSize: 13,
    fontWeight: '600',
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
