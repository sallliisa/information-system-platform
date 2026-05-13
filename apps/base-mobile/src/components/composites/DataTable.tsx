import type { ListConfig } from '@southneuhof/is-data-model'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  type FlatListProps,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { api } from '../../lib/api'
import { formatValue } from '../../lib/format'
import { materialColors } from '../../theme/material'
import { Card } from '../base'

export type DataTablePageResponse =
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

export type DataTableGetData = (
  getAPI: string,
  searchParameters?: Record<string, any>
) => Promise<DataTablePageResponse>

export type UseDataTableControllerOptions = {
  data?: Record<string, any>[]
  getData?: DataTableGetData
  onDataLoaded?: (data: Record<string, any>[]) => void
  getAPI?: string
  searchParameters?: Record<string, any>
  pageSize?: number
  infiniteScroll?: boolean
  draggable?: boolean
}

export type DataTableController = {
  rows: Record<string, any>[]
  initialLoading: boolean
  loadingMore: boolean
  error: boolean
  loadMoreError: boolean
  page: number
  total?: number
  totalPage?: number
  hasStaticData: boolean
  infiniteScrollEnabled: boolean
  canLoadMore: boolean
  loadMore: () => Promise<void>
  retryLoadMore: () => Promise<void>
  reload: () => Promise<void>
}

export type DataTableProps = ListConfig & {
  data?: Record<string, any>[]
  getData?: DataTableGetData
  onDataLoaded?: (data: Record<string, any>[]) => void
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
  emptyText?: string
  pageSize?: number
  infiniteScroll?: boolean
  listContentContainerStyle?: FlatListProps<Record<string, any>>['contentContainerStyle']
  listStyle?: FlatListProps<Record<string, any>>['style']
  onEndReachedThreshold?: number
}

export type DataTableContentProps = ListConfig & {
  controller: Pick<
    DataTableController,
    'rows' | 'initialLoading' | 'loadingMore' | 'loadMoreError' | 'retryLoadMore'
  >
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
  emptyText?: string
}

export type DataTableExternalScrollOptions = {
  controller: Pick<DataTableController, 'canLoadMore' | 'loadMore'>
  threshold?: number
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

function DataTableInitialLoading() {
  return (
    <View className="items-center justify-center py-7">
      <ActivityIndicator size="small" color={materialColors.primary} />
    </View>
  )
}

type DataTableRowProps = ListConfig & {
  item: Record<string, any>
  onPressRow?: (row: Record<string, any>) => void
  rowActions?: (row: Record<string, any>) => ReactNode
}

function DataTableRow({
  item,
  fields = [],
  fieldsAlias = {},
  fieldsProxy = {},
  fieldsDictionary = {},
  fieldsParse = {},
  fieldsUnit = {},
  onPressRow,
  rowActions,
}: DataTableRowProps) {
  return (
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
              <Text
                className="flex-1 text-[11px] font-bold uppercase"
                style={{ color: materialColors.onSurfaceVariant }}
              >
                {fieldsAlias[field] || field}
              </Text>
              <Text className="flex-[1.2] text-right text-sm" style={{ color: materialColors.onSurface }}>
                {value}
              </Text>
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
  )
}

function DataTableSeparator() {
  return <View className="h-2.5" />
}

function DataTableFooter({
  loadingMore,
  loadMoreError,
  onRetry,
}: {
  loadingMore: boolean
  loadMoreError: boolean
  onRetry: () => void
}) {
  if (loadingMore) {
    return (
      <View className="py-3 items-center justify-center">
        <ActivityIndicator size="small" color={materialColors.primary} />
      </View>
    )
  }

  if (loadMoreError) {
    return (
      <View className="py-3 items-center justify-center gap-1.5">
        <Text className="text-xs" style={{ color: materialColors.onSurfaceVariant }}>
          Failed to load more data.
        </Text>
        <Pressable onPress={onRetry}>
          <Text className="text-xs font-bold" style={{ color: materialColors.primary }}>
            Retry
          </Text>
        </Pressable>
      </View>
    )
  }

  return null
}

function DataTableEmpty({ emptyText }: { emptyText: string }) {
  return (
    <Card type="outlined" color="surfaceContainerLow">
      <Text className="text-center text-sm" style={{ color: materialColors.onSurfaceVariant }}>
        {emptyText}
      </Text>
    </Card>
  )
}

export function useDataTableController({
  data,
  getData = defaultListGetData,
  onDataLoaded,
  getAPI,
  searchParameters,
  pageSize = 10,
  infiniteScroll,
  draggable = false,
}: UseDataTableControllerOptions): DataTableController {
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
  const resolvedSearchParameters = useMemo(
    () => searchParameters ?? EMPTY_SEARCH_PARAMETERS,
    [searchParameters]
  )
  const hasStaticData = data !== undefined
  const infiniteScrollEnabled = infiniteScroll ?? (!!getAPI && !hasStaticData)

  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
  }, [onDataLoaded])

  const reload = useCallback(async () => {
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
  }, [data, draggable, getAPI, getData, hasStaticData, pageSize, resolvedSearchParameters])

  useEffect(() => {
    void reload()
  }, [reload])

  const allRowsLoaded =
    (totalPage !== undefined && page >= totalPage) || (total !== undefined && rows.length >= total)

  const canLoadMore =
    !initialLoading &&
    !loadingMore &&
    !error &&
    !hasStaticData &&
    !!getAPI &&
    infiniteScrollEnabled &&
    !draggable &&
    !allRowsLoaded

  const loadMore = useCallback(async () => {
    if (!canLoadMore || !getAPI) return

    const nextPage = page + 1
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
  }, [canLoadMore, getAPI, getData, page, pageSize, resolvedSearchParameters])

  const retryLoadMore = useCallback(async () => {
    await loadMore()
  }, [loadMore])

  return {
    rows,
    initialLoading,
    loadingMore,
    error,
    loadMoreError,
    page,
    total,
    totalPage,
    hasStaticData,
    infiniteScrollEnabled,
    canLoadMore,
    loadMore,
    retryLoadMore,
    reload,
  }
}

export function DataTableContent({
  controller,
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
}: DataTableContentProps) {
  if (controller.initialLoading) {
    return <DataTableInitialLoading />
  }

  return (
    <View>
      {controller.rows.length ? (
        controller.rows.map((item, index) => (
          <View key={String(item[uid] ?? index)}>
            {index > 0 ? <DataTableSeparator /> : null}
            <DataTableRow
              item={item}
              fields={fields}
              fieldsAlias={fieldsAlias}
              fieldsProxy={fieldsProxy}
              fieldsDictionary={fieldsDictionary}
              fieldsParse={fieldsParse}
              fieldsUnit={fieldsUnit}
              onPressRow={onPressRow}
              rowActions={rowActions}
            />
          </View>
        ))
      ) : (
        <DataTableEmpty emptyText={emptyText} />
      )}
      <DataTableFooter
        loadingMore={controller.loadingMore}
        loadMoreError={controller.loadMoreError}
        onRetry={() => void controller.retryLoadMore()}
      />
    </View>
  )
}

export function useDataTableExternalScroll({
  controller,
  threshold = 240,
}: DataTableExternalScrollOptions) {
  const loadTriggeredRef = useRef(false)
  const contentHeightRef = useRef(0)

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent

      if (contentSize.height !== contentHeightRef.current) {
        contentHeightRef.current = contentSize.height
        loadTriggeredRef.current = false
      }

      const isNearBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold

      if (!isNearBottom) {
        loadTriggeredRef.current = false
        return
      }

      if (loadTriggeredRef.current || !controller.canLoadMore) return

      loadTriggeredRef.current = true
      void controller.loadMore()
    },
    [controller, threshold]
  )

  return {
    onScroll,
    scrollEventThrottle: 16,
  }
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
  listContentContainerStyle,
  listStyle,
  onEndReachedThreshold = 0.4,
}: DataTableProps) {
  const controller = useDataTableController({
    data,
    getData,
    onDataLoaded,
    getAPI,
    searchParameters,
    pageSize,
    infiniteScroll,
    draggable,
  })

  if (controller.initialLoading) {
    return <DataTableInitialLoading />
  }

  return (
    <FlatList
      testID="data-table-flat-list"
      data={controller.rows}
      keyExtractor={(item, index) => String(item[uid] ?? index)}
      renderItem={({ item }) => (
        <DataTableRow
          item={item}
          fields={fields}
          fieldsAlias={fieldsAlias}
          fieldsProxy={fieldsProxy}
          fieldsDictionary={fieldsDictionary}
          fieldsParse={fieldsParse}
          fieldsUnit={fieldsUnit}
          onPressRow={onPressRow}
          rowActions={rowActions}
        />
      )}
      ItemSeparatorComponent={DataTableSeparator}
      onEndReached={() => {
        void controller.loadMore()
      }}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={
        <DataTableFooter
          loadingMore={controller.loadingMore}
          loadMoreError={controller.loadMoreError}
          onRetry={() => void controller.retryLoadMore()}
        />
      }
      ListEmptyComponent={<DataTableEmpty emptyText={emptyText} />}
      keyboardShouldPersistTaps="handled"
      style={listStyle}
      contentContainerStyle={listContentContainerStyle}
    />
  )
})
