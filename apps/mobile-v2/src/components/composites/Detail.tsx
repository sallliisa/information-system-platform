import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Card } from '../base'
import { materialColors } from '../../theme/material'

type DetailProps = {
  getAPI: string
  dataID?: string
  fields: string[]
  fieldsAlias?: Record<string, string>
  fieldsProxy?: Record<string, string>
  fieldsDictionary?: Record<string, Record<string, string>>
  fieldsParse?: Record<string, string>
  searchParameters?: Record<string, any>
  onDataLoaded?: (data: Record<string, any>) => void
}

const EMPTY_SEARCH_PARAMETERS: Record<string, any> = {}

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

export function Detail({
  getAPI,
  dataID,
  fields,
  fieldsAlias = {},
  fieldsProxy = {},
  fieldsDictionary = {},
  fieldsParse = {},
  searchParameters,
  onDataLoaded,
}: DetailProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Record<string, any>>({})
  const resolvedSearchParameters = searchParameters ?? EMPTY_SEARCH_PARAMETERS

  useEffect(() => {
    let mounted = true

    const timeoutId = setTimeout(() => {
      if (!mounted) return

      // Stub behavior for phase 1: provides deterministic data shape for slot wiring.
      const nextData: Record<string, any> = {
        id: dataID,
        __stub: true,
        __api: getAPI,
        ...resolvedSearchParameters,
      }
      setData(nextData)
      onDataLoaded?.(nextData)
      setLoading(false)
    }, 120)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [dataID, getAPI, onDataLoaded, resolvedSearchParameters])

  const rows = useMemo(
    () =>
      fields.map((field) => {
        const sourceField = fieldsProxy[field] || field
        const rawValue = data[sourceField]
        const dictionary = fieldsDictionary[field]
        const value =
          dictionary && rawValue !== undefined && rawValue !== null
            ? dictionary[String(rawValue)] ?? '-'
            : formatValue(fieldsParse[field], rawValue)

        return {
          field,
          label: fieldsAlias[field] || field,
          value,
        }
      }),
    [data, fields, fieldsAlias, fieldsDictionary, fieldsParse, fieldsProxy]
  )

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Card>
      <View style={styles.container}>
        <Text style={styles.stubNote}>Detail stub active in mobile-v2 phase</Text>
        {rows.map((row) => (
          <View key={row.field} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  container: {
    gap: 10,
  },
  stubNote: {
    fontSize: 12,
    color: materialColors.onSurfaceVariant,
  },
  row: {
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: materialColors.onSurfaceVariant,
  },
  value: {
    fontSize: 14,
    color: materialColors.onSurface,
  },
})
