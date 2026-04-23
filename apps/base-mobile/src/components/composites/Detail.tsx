import type { DetailConfig } from '@repo/model-meta'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { materialColors } from '../../theme/material'
import { Card } from '../base'

type DetailProps = DetailConfig & {
  data?: Record<string, any>
  getData?: (getAPI: string, searchParameters?: Record<string, any>, dataID?: string) => Promise<Record<string, any>>
  onDataLoaded?: (data: Record<string, any>) => void
}

const EMPTY_SEARCH_PARAMETERS: Record<string, any> = {}

function normalizeDetailData(payload: unknown): Record<string, any> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }
  return payload as Record<string, any>
}

async function defaultDetailGetData(getAPI: string, searchParameters?: Record<string, any>, dataID?: string) {
  const response = await api.detail(getAPI, dataID, searchParameters)
  return normalizeDetailData(response?.data ?? response)
}

function resolveFieldValue(params: {
  field: string
  rawData: Record<string, any>
  fieldsProxy: Record<string, string>
  fieldsDictionary: Record<string, Record<string, string>>
  fieldsParse: Record<string, string>
  fieldsUnit: Record<string, string>
}): string {
  const { field, rawData, fieldsProxy, fieldsDictionary, fieldsParse, fieldsUnit } = params
  const sourceField = fieldsProxy[field] || field
  const rawValue = rawData[sourceField]
  const dictionary = fieldsDictionary[field]
  const baseValue =
    dictionary && rawValue !== undefined && rawValue !== null ? dictionary[String(rawValue)] ?? '-' : formatValue(fieldsParse[field], rawValue)

  if (baseValue === '-') return baseValue
  if (!fieldsUnit[field]) return baseValue
  return `${baseValue}${fieldsUnit[field]}`
}

export function Detail({
  data,
  getData = defaultDetailGetData,
  onDataLoaded,
  fields = [],
  fieldsAlias = {},
  fieldsProxy = {},
  fieldsDictionary = {},
  fieldsParse = {},
  fieldsUnit = {},
  getAPI,
  dataID,
  searchParameters,
}: DetailProps) {
  const onDataLoadedRef = useRef(onDataLoaded)
  const [loading, setLoading] = useState(true)
  const [detailData, setDetailData] = useState<Record<string, any>>({})
  const resolvedSearchParameters = useMemo(() => searchParameters ?? EMPTY_SEARCH_PARAMETERS, [searchParameters])

  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
  }, [onDataLoaded])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)

      if (data) {
        const nextData = normalizeDetailData(data)
        if (!mounted) return
        setDetailData(nextData)
        onDataLoadedRef.current?.(nextData)
        setLoading(false)
        return
      }

      if (!getAPI || !dataID) {
        if (!mounted) return
        setDetailData({})
        onDataLoadedRef.current?.({})
        setLoading(false)
        return
      }

      try {
        const response = await getData(getAPI, resolvedSearchParameters, dataID)
        if (!mounted) return
        const nextData = normalizeDetailData((response as any)?.data ?? response)
        setDetailData(nextData)
        onDataLoadedRef.current?.(nextData)
      } catch {
        if (!mounted) return
        setDetailData({})
        onDataLoadedRef.current?.({})
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [data, dataID, getAPI, getData, resolvedSearchParameters])

  const rows = useMemo(
    () =>
      fields.map((field) => {
        if (field.startsWith('S|')) {
          return { kind: 'section' as const, field, title: field.slice(2) }
        }

        const value = resolveFieldValue({
          field,
          rawData: detailData,
          fieldsProxy,
          fieldsDictionary,
          fieldsParse,
          fieldsUnit,
        })

        return {
          kind: 'field' as const,
          field,
          label: fieldsAlias[field] || field,
          value,
        }
      }),
    [detailData, fields, fieldsAlias, fieldsDictionary, fieldsParse, fieldsProxy, fieldsUnit]
  )

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  return (
    <Card type="outlined" color="surface">
      <View style={styles.container}>
        {rows.map((row, index) => {
          if (row.kind === 'section') {
            return (
              <View key={`${row.field}-${index}`} style={styles.sectionWrap}>
                <Text style={styles.sectionLabel}>{row.title}</Text>
              </View>
            )
          }

          return (
            <View key={`${row.field}-${index}`} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          )
        })}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  container: {
    gap: 8,
  },
  sectionWrap: {
    marginTop: 4,
    paddingTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: materialColors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
})
