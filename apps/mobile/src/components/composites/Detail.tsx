import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { Card } from '../base'

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
  const onDataLoadedRef = useRef(onDataLoaded)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Record<string, any>>({})
  const resolvedSearchParameters = searchParameters ?? EMPTY_SEARCH_PARAMETERS

  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
  }, [onDataLoaded])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!dataID) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await api.detail(getAPI, dataID, resolvedSearchParameters)
        const nextData = response?.data ?? response
        if (!mounted) return
        setData(nextData || {})
        onDataLoadedRef.current?.(nextData || {})
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [dataID, getAPI, resolvedSearchParameters])

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
      <View className="items-center py-8">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Card>
      <View className="gap-3">
        {rows.map((row) => (
          <View key={row.field} className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.label}</Text>
            <Text className="text-sm text-text">{row.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  )
}

const EMPTY_SEARCH_PARAMETERS: Record<string, any> = {}
