import { memo, type ReactNode } from 'react'
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { Card } from '../base'
import { materialColors } from '../../theme/material'

type DataTableProps = {
  fields: string[]
  data: Record<string, any>[]
  fieldsAlias?: Record<string, string>
  fieldsProxy?: Record<string, string>
  fieldsDictionary?: Record<string, Record<string, string>>
  fieldsParse?: Record<string, string>
  keyField?: string
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
  emptyText?: string
  contentContainerStyle?: StyleProp<ViewStyle>
}

function formatValue(type: string | undefined, value: any): string {
  if (value === null || value === undefined || value === '') return '-'
  if (!type) return String(value)

  if (type === 'date') {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return String(value)
    return parsed.toLocaleDateString()
  }

  if (type === 'datetime') {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return String(value)
    return parsed.toLocaleString()
  }

  if (type === 'currency') {
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return String(value)
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(numeric)
  }

  return String(value)
}

export const DataTable = memo(function DataTable({
  fields,
  data,
  fieldsAlias = {},
  fieldsProxy = {},
  fieldsDictionary = {},
  fieldsParse = {},
  keyField = 'id',
  onPressRow,
  rowActions,
  emptyText = 'No data available',
  contentContainerStyle,
}: DataTableProps) {
  if (!data.length) {
    return (
      <Card>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </Card>
    )
  }

  return (
    <View style={[styles.container, contentContainerStyle]}>
      {data.map((item, index) => (
        <Card
          key={String(item[keyField] ?? index)}
          type="outlined"
          onPress={onPressRow ? () => onPressRow(item) : undefined}
          style={styles.card}
        >
          <View style={styles.rowStack}>
            {fields.map((field) => {
              const sourceField = fieldsProxy[field] || field
              const rawValue = item[sourceField]
              const dictionary = fieldsDictionary[field]
              const value =
                dictionary && rawValue !== undefined && rawValue !== null
                  ? dictionary[String(rawValue)] ?? '-'
                  : formatValue(fieldsParse[field], rawValue)

              return (
                <View key={field} style={styles.dataRow}>
                  <Text style={styles.label}>{fieldsAlias[field] || field}</Text>
                  <Text style={styles.value}>{value}</Text>
                </View>
              )
            })}
            {rowActions ? <View style={styles.actions}>{rowActions(item)}</View> : null}
          </View>
        </Card>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    gap: 8,
  },
  rowStack: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: materialColors.onSurfaceVariant,
  },
  value: {
    flex: 1.2,
    textAlign: 'right',
    fontSize: 14,
    color: materialColors.onSurface,
  },
  actions: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: materialColors.outlineVariant,
  },
  emptyText: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
    textAlign: 'center',
  },
})
