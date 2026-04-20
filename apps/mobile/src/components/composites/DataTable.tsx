import { memo, type ReactNode } from 'react'
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { formatValue } from '../../lib/format'

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
  emptyText = 'Tidak ada data',
  contentContainerStyle,
}: DataTableProps) {
  if (!data.length) {
    return (
      <View className="rounded-xl border border-border bg-white p-4">
        <Text className="text-center text-slate-500">{emptyText}</Text>
      </View>
    )
  }

  return (
    <View style={contentContainerStyle} className="gap-2.5">
      {data.map((item, index) => (
        <Pressable
          key={String(item[keyField] ?? index)}
          className="rounded-xl border border-border bg-white p-4"
          onPress={() => onPressRow?.(item)}
        >
          <View className="gap-2">
            {fields.map((field) => {
              const sourceField = fieldsProxy[field] || field
              const rawValue = item[sourceField]
              const dictionary = fieldsDictionary[field]
              const value =
                dictionary && rawValue !== undefined && rawValue !== null
                  ? dictionary[String(rawValue)] ?? '-'
                  : formatValue(fieldsParse[field], rawValue)

              return (
                <View key={field} className="flex-row justify-between gap-3">
                  <Text className="flex-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {fieldsAlias[field] || field}
                  </Text>
                  <Text className="flex-[1.2] text-right text-sm text-text">{value}</Text>
                </View>
              )
            })}
            {rowActions ? <View className="mt-2 border-t border-border pt-2">{rowActions(item)}</View> : null}
          </View>
        </Pressable>
      ))}
    </View>
  )
})
