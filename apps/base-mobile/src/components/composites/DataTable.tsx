import type { ListConfig } from '@repo/model-meta'
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { materialColors } from '../../theme/material'
import { Card } from '../base'

type DataTablePageResponse =
  | Record<string, any>[]
  | {
      data?: Record<string, any>[]
      total?: number
      totalPage?: number
    }

type NormalizedPage = {
  rows: Record<string, any>[]
  total?: number
  totalPage?: number
}

type DataTableProps = ListConfig & {
  data?: Record<string, any>[]
  getData?: (getAPI: string, searchParameters?: Record<string, any>) => Promise<DataTablePageResponse>
  onDataLoaded?: (data: Record<string, any>[]) => void
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
  emptyText?: string
  pageSize?: number
  infiniteScroll?: boolean
}

const EMPTY_SEARCH_PARAMETERS: Record<string, any> = {}

function normalizePage(payload: unknown): NormalizedPage {
  if (Array.isArray(payload)) return { rows: payload }
  if (payload && typeof payload === 'object') {
    const typedPayload = payload as Record<string, any>
    const rows = Array.isArray(typedPayload.data) ? typedPayload.data : []
    const total = typeof typedPayload.total === 'number' ? typedPayload.total : undefined
    const totalPage = typeof typedPayload.totalPage === 'number' ? typedPayload.totalPage : undefined
    return { rows, total, totalPage }
  }
  return { rows: [] }
}

async function defaultListGetData(getAPI: string, searchParameters?: Record<string, any>) {
  return api.list(getAPI, searchParameters) as Promise<DataTablePageResponse>
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
  pageSize = 10,
  infiniteScroll,
  draggable = false,
}: DataTableProps) {
  const onDataLoadedRef = useRef(onDataLoaded)
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState<number | undefined>()
  const [total, setTotal] = useState<number | undefined>()
  const requestSeqRef = useRef(0)
  const resolvedSearchParameters = useMemo(() => searchParameters ?? EMPTY_SEARCH_PARAMETERS, [searchParameters])
  const hasStaticData = data !== undefined
  const isInfiniteScrollEnabled = infiniteScroll ?? (!!getAPI && !hasStaticData)

  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
  }, [onDataLoaded])

  useEffect(() => {
    async function load() {
      const requestSeq = requestSeqRef.current + 1
      requestSeqRef.current = requestSeq

      setInitialLoading(true)
      setLoadingMore(false)
      setError(false)
      setLoadMoreError(false)
      setPage(1)
      setTotal(undefined)
      setTotalPage(undefined)

      if (hasStaticData) {
        const nextRows = normalizePage(data).rows
        setRows(nextRows)
        onDataLoadedRef.current?.(nextRows)
        setInitialLoading(false)
        return
      }

      if (!getAPI) {
        setRows([])
        onDataLoadedRef.current?.([])
        setInitialLoading(false)
        return
      }

      const firstPageLimit = draggable ? 9999 : pageSize
      const firstPageSearchParameters = {
        ...resolvedSearchParameters,
        page: '1',
        limit: firstPageLimit,
      }

      try {
        const fetchedRows = await getData(getAPI, firstPageSearchParameters)
        if (requestSeqRef.current !== requestSeq) return
        const normalized = normalizePage(fetchedRows)
        const nextRows = normalized.rows
        setRows(nextRows)
        setTotal(normalized.total)
        setTotalPage(normalized.totalPage)
        onDataLoadedRef.current?.(nextRows)
      } catch {
        if (requestSeqRef.current !== requestSeq) return
        setRows([])
        setError(true)
        onDataLoadedRef.current?.([])
      } finally {
        if (requestSeqRef.current === requestSeq) {
          setInitialLoading(false)
        }
      }
    }

    void load()
  }, [data, draggable, getAPI, getData, hasStaticData, pageSize, isInfiniteScrollEnabled, resolvedSearchParameters])

  const loadPage = async (nextPage: number) => {
    if (initialLoading || loadingMore || error || hasStaticData || !getAPI || !isInfiniteScrollEnabled || draggable) {
      return
    }

    if (totalPage !== undefined && page >= totalPage) return
    if (total !== undefined && rows.length >= total) return

    const requestSeq = requestSeqRef.current + 1
    requestSeqRef.current = requestSeq
    setLoadingMore(true)
    setLoadMoreError(false)

    const nextPageSearchParameters = {
      ...resolvedSearchParameters,
      page: String(nextPage),
      limit: pageSize,
    }

    try {
      const pageResponse = await getData(getAPI, nextPageSearchParameters)
      if (requestSeqRef.current !== requestSeq) return
      const normalized = normalizePage(pageResponse)
      const nextRows = normalized.rows

      setRows((previousRows) => {
        const mergedRows = nextRows.length ? [...previousRows, ...nextRows] : previousRows
        if (!nextRows.length && normalized.total === undefined && normalized.totalPage === undefined) {
          setTotal((previousTotal) => previousTotal ?? mergedRows.length)
        }
        onDataLoadedRef.current?.(mergedRows)
        return mergedRows
      })
      setPage(nextPage)
      setTotal(normalized.total)
      setTotalPage(normalized.totalPage)
    } catch {
      if (requestSeqRef.current !== requestSeq) return
      setLoadMoreError(true)
    } finally {
      if (requestSeqRef.current === requestSeq) {
        setLoadingMore(false)
      }
    }
  }

  const handleEndReached = () => {
    void loadPage(page + 1)
  }

  if (initialLoading) {
    return (
      <View className="items-center justify-center py-7">
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  return (
    <FlatList
      testID="data-table-flat-list"
      data={rows}
      keyExtractor={(item, index) => String(item[uid] ?? index)}
      renderItem={({ item }) => (
        <Card type="outlined" color="surface" onPress={onPressRow ? () => onPressRow(item) : undefined}>
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
      )}
      ItemSeparatorComponent={() => <View className="h-2.5" />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View className="py-3 items-center justify-center">
            <ActivityIndicator size="small" color={materialColors.primary} />
          </View>
        ) : loadMoreError ? (
          <View className="py-3 items-center justify-center gap-1.5">
            <Text className="text-xs" style={{ color: materialColors.onSurfaceVariant }}>
              Failed to load more data.
            </Text>
            <Pressable onPress={() => void loadPage(page + 1)}>
              <Text className="text-xs font-bold" style={{ color: materialColors.primary }}>Retry</Text>
            </Pressable>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <Card type="outlined" color="surfaceContainerLow">
          <Text className="text-center text-sm" style={{ color: materialColors.onSurfaceVariant }}>{emptyText}</Text>
        </Card>
      }
      keyboardShouldPersistTaps="handled"
    />
  )
})
