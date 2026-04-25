import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Pressable, ScrollView, Text, View } from 'react-native'
import {
  DataTable,
  DataTableContent,
  type DataTableController,
  useDataTableController,
  useDataTableExternalScroll,
  type UseDataTableControllerOptions,
} from '../DataTable'

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function buildTableProps(overrides: Record<string, any> = {}) {
  return {
    fields: ['name'],
    fieldsAlias: { name: 'Name' },
    uid: 'id',
    ...overrides,
  }
}

function ControllerHarness(props: UseDataTableControllerOptions) {
  const controller = useDataTableController(props)

  return (
    <View>
      <Text testID="controller-page">{String(controller.page)}</Text>
      <Text testID="controller-can-load-more">{String(controller.canLoadMore)}</Text>
      <Text testID="controller-initial-loading">{String(controller.initialLoading)}</Text>
      <Text testID="controller-loading-more">{String(controller.loadingMore)}</Text>
      <Text testID="controller-total">{String(controller.total)}</Text>
      {controller.rows.map((row, index) => (
        <Text key={String(row.id ?? index)}>{String(row.name ?? row.id)}</Text>
      ))}
      <Pressable testID="controller-load-more" onPress={() => void controller.loadMore()}>
        <Text>load-more</Text>
      </Pressable>
      <Pressable testID="controller-retry-load-more" onPress={() => void controller.retryLoadMore()}>
        <Text>retry-load-more</Text>
      </Pressable>
    </View>
  )
}

function ExternalScrollHarness({
  controller,
  threshold,
}: {
  controller: Pick<DataTableController, 'canLoadMore' | 'loadMore'>
  threshold?: number
}) {
  const tableScroll = useDataTableExternalScroll({ controller, threshold })

  return (
    <ScrollView
      testID="external-scroll"
      onScroll={tableScroll.onScroll}
      scrollEventThrottle={tableScroll.scrollEventThrottle}
    >
      <View style={{ height: 12 }} />
    </ScrollView>
  )
}

describe('DataTable', () => {
  it('renders static data without API calls', async () => {
    const getData = jest.fn(async () => [])
    const onDataLoaded = jest.fn()
    const rows = [{ id: 1, name: 'Alice' }]

    render(<DataTable {...buildTableProps({ data: rows, getData, onDataLoaded })} />)

    await screen.findByText('Alice')
    expect(getData).not.toHaveBeenCalled()
    expect(onDataLoaded).toHaveBeenCalledWith(rows)
  })

  it('uses default first-page params for remote fetch', async () => {
    const getData = jest.fn(async () => ({ data: [] }))

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData })} />)

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith('/users', { page: '1', limit: 10 })
    })
  })

  it('preserves search params while enforcing internal page and limit', async () => {
    const getData = jest.fn(async () => ({ data: [] }))

    render(
      <DataTable
        {...buildTableProps({
          getAPI: '/users',
          getData,
          searchParameters: { search: 'alice', sort_by: 'name', sort: 'asc' },
        })}
      />
    )

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith('/users', {
        search: 'alice',
        sort_by: 'name',
        sort: 'asc',
        page: '1',
        limit: 10,
      })
    })
  })

  it('uses pageSize as limit override', async () => {
    const getData = jest.fn(async () => ({ data: [] }))

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData, pageSize: 20 })} />)

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith('/users', { page: '1', limit: 20 })
    })
  })

  it('appends page 2 rows on infinite scroll', async () => {
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice' }], totalPage: 2, total: 2 })
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Bob' }], totalPage: 2, total: 2 })
    const onDataLoaded = jest.fn()

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData, onDataLoaded })} />)

    await screen.findByText('Alice')

    fireEvent(screen.getByTestId('data-table-flat-list'), 'onEndReached')

    await screen.findByText('Bob')

    expect(getData).toHaveBeenNthCalledWith(2, '/users', { page: '2', limit: 10 })
    expect(onDataLoaded).toHaveBeenLastCalledWith([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
  })

  it('does not fetch more pages when totalPage is 1', async () => {
    const getData = jest.fn(async () => ({ data: [{ id: 1, name: 'Alice' }], totalPage: 1, total: 1 }))

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData })} />)

    await screen.findByText('Alice')
    fireEvent(screen.getByTestId('data-table-flat-list'), 'onEndReached')

    await waitFor(() => {
      expect(getData).toHaveBeenCalledTimes(1)
    })
  })

  it('stops after empty next page when metadata is absent', async () => {
    const getData = jest.fn().mockResolvedValueOnce([{ id: 1, name: 'Alice' }]).mockResolvedValueOnce([])

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData })} />)

    await screen.findByText('Alice')

    fireEvent(screen.getByTestId('data-table-flat-list'), 'onEndReached')

    await waitFor(() => {
      expect(getData).toHaveBeenCalledTimes(2)
    })

    fireEvent(screen.getByTestId('data-table-flat-list'), 'onEndReached')

    await waitFor(() => {
      expect(getData).toHaveBeenCalledTimes(2)
    })
  })

  it('resets to page 1 and replaces rows when search params change', async () => {
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alpha' }] })
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Beta' }] })

    const { rerender } = render(
      <DataTable
        {...buildTableProps({
          getAPI: '/users',
          getData,
          searchParameters: { search: 'a' },
        })}
      />
    )

    await screen.findByText('Alpha')

    rerender(
      <DataTable
        {...buildTableProps({
          getAPI: '/users',
          getData,
          searchParameters: { search: 'b' },
        })}
      />
    )

    await screen.findByText('Beta')

    expect(screen.queryByText('Alpha')).toBeNull()
    expect(getData).toHaveBeenNthCalledWith(2, '/users', {
      search: 'b',
      page: '1',
      limit: 10,
    })
  })

  it('ignores stale responses after search param changes', async () => {
    const firstRequest = createDeferred<any>()
    const secondRequest = createDeferred<any>()

    const getData = jest
      .fn()
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise)

    const { rerender } = render(
      <DataTable
        {...buildTableProps({
          getAPI: '/users',
          getData,
          searchParameters: { search: 'a' },
        })}
      />
    )

    rerender(
      <DataTable
        {...buildTableProps({
          getAPI: '/users',
          getData,
          searchParameters: { search: 'b' },
        })}
      />
    )

    secondRequest.resolve({ data: [{ id: 2, name: 'Latest' }] })
    await screen.findByText('Latest')

    firstRequest.resolve({ data: [{ id: 1, name: 'Stale' }] })

    await waitFor(() => {
      expect(screen.queryByText('Stale')).toBeNull()
      expect(screen.getByText('Latest')).toBeTruthy()
    })
  })

  it('renders empty state on initial API error', async () => {
    const getData = jest.fn(async () => {
      throw new Error('failed')
    })

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData })} />)

    await screen.findByText('No data available.')
  })

  it('keeps rows and shows retry footer when load-more fails', async () => {
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice' }], totalPage: 2, total: 2 })
      .mockRejectedValueOnce(new Error('page 2 failed'))
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Bob' }], totalPage: 2, total: 2 })

    render(<DataTable {...buildTableProps({ getAPI: '/users', getData })} />)

    await screen.findByText('Alice')

    fireEvent(screen.getByTestId('data-table-flat-list'), 'onEndReached')

    await screen.findByText('Failed to load more data.')
    expect(screen.getByText('Alice')).toBeTruthy()

    fireEvent.press(screen.getByText('Retry'))

    await screen.findByText('Bob')
    expect(getData).toHaveBeenNthCalledWith(3, '/users', { page: '2', limit: 10 })
  })
})

describe('useDataTableController', () => {
  it('fetches first-page remote rows and metadata', async () => {
    const getData = jest.fn(async () => ({ data: [{ id: 1, name: 'Alice' }], totalPage: 3, total: 5 }))

    render(<ControllerHarness getAPI="/users" getData={getData} />)

    await screen.findByText('Alice')
    expect(screen.getByTestId('controller-page')).toHaveTextContent('1')
    expect(getData).toHaveBeenCalledWith('/users', { page: '1', limit: 10 })
  })

  it('loadMore appends rows', async () => {
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice' }], totalPage: 2, total: 2 })
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Bob' }], totalPage: 2, total: 2 })

    render(<ControllerHarness getAPI="/users" getData={getData} />)

    await screen.findByText('Alice')
    fireEvent.press(screen.getByTestId('controller-load-more'))
    await screen.findByText('Bob')

    expect(getData).toHaveBeenNthCalledWith(2, '/users', { page: '2', limit: 10 })
  })

  it('canLoadMore is false while loading more', async () => {
    const secondRequest = createDeferred<any>()
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice' }], totalPage: 2, total: 2 })
      .mockImplementationOnce(() => secondRequest.promise)

    render(<ControllerHarness getAPI="/users" getData={getData} />)

    await screen.findByText('Alice')
    fireEvent.press(screen.getByTestId('controller-load-more'))

    await waitFor(() => {
      expect(screen.getByTestId('controller-can-load-more')).toHaveTextContent('false')
      expect(screen.getByTestId('controller-loading-more')).toHaveTextContent('true')
    })

    secondRequest.resolve({ data: [{ id: 2, name: 'Bob' }], totalPage: 2, total: 2 })
    await screen.findByText('Bob')
  })

  it('canLoadMore is false after all pages are loaded', async () => {
    const getData = jest.fn(async () => ({ data: [{ id: 1, name: 'Alice' }], totalPage: 1, total: 1 }))

    render(<ControllerHarness getAPI="/users" getData={getData} />)

    await screen.findByText('Alice')

    await waitFor(() => {
      expect(screen.getByTestId('controller-can-load-more')).toHaveTextContent('false')
    })
  })

  it('uses static data and skips remote fetch', async () => {
    const getData = jest.fn(async () => [])

    render(<ControllerHarness data={[{ id: 1, name: 'Alice' }]} getData={getData} />)

    await screen.findByText('Alice')
    expect(getData).not.toHaveBeenCalled()
  })

  it('resets rows and page when search parameters change', async () => {
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alpha' }] })
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Beta' }] })

    const { rerender } = render(
      <ControllerHarness getAPI="/users" getData={getData} searchParameters={{ search: 'a' }} />
    )

    await screen.findByText('Alpha')

    rerender(<ControllerHarness getAPI="/users" getData={getData} searchParameters={{ search: 'b' }} />)

    await screen.findByText('Beta')
    expect(screen.queryByText('Alpha')).toBeNull()
    expect(screen.getByTestId('controller-page')).toHaveTextContent('1')
  })

  it('ignores stale first request after params change', async () => {
    const firstRequest = createDeferred<any>()
    const secondRequest = createDeferred<any>()
    const getData = jest
      .fn()
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise)

    const { rerender } = render(
      <ControllerHarness getAPI="/users" getData={getData} searchParameters={{ search: 'a' }} />
    )

    rerender(<ControllerHarness getAPI="/users" getData={getData} searchParameters={{ search: 'b' }} />)

    secondRequest.resolve({ data: [{ id: 2, name: 'Latest' }] })
    await screen.findByText('Latest')

    firstRequest.resolve({ data: [{ id: 1, name: 'Stale' }] })

    await waitFor(() => {
      expect(screen.queryByText('Stale')).toBeNull()
    })
  })

  it('uses draggable first page limit 9999 and disables load more', async () => {
    const getData = jest.fn(async () => ({ data: [{ id: 1, name: 'Alice' }] }))

    render(<ControllerHarness getAPI="/users" getData={getData} draggable />)

    await screen.findByText('Alice')
    expect(getData).toHaveBeenCalledWith('/users', { page: '1', limit: 9999 })

    fireEvent.press(screen.getByTestId('controller-load-more'))

    await waitFor(() => {
      expect(getData).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('controller-can-load-more')).toHaveTextContent('false')
    })
  })

  it('with infiniteScroll false fetches first page but does not load more', async () => {
    const getData = jest.fn(async () => ({ data: [{ id: 1, name: 'Alice' }], totalPage: 5, total: 100 }))

    render(<ControllerHarness getAPI="/users" getData={getData} infiniteScroll={false} />)

    await screen.findByText('Alice')
    fireEvent.press(screen.getByTestId('controller-load-more'))

    await waitFor(() => {
      expect(getData).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('controller-can-load-more')).toHaveTextContent('false')
    })
  })

  it('retryLoadMore retries failed next page', async () => {
    const getData = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice' }], totalPage: 2, total: 2 })
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Bob' }], totalPage: 2, total: 2 })

    render(<ControllerHarness getAPI="/users" getData={getData} />)

    await screen.findByText('Alice')
    fireEvent.press(screen.getByTestId('controller-load-more'))

    await waitFor(() => {
      expect(screen.getByTestId('controller-loading-more')).toHaveTextContent('false')
    })

    fireEvent.press(screen.getByTestId('controller-retry-load-more'))
    await screen.findByText('Bob')

    expect(getData).toHaveBeenNthCalledWith(3, '/users', { page: '2', limit: 10 })
  })
})

describe('DataTableContent', () => {
  const baseProps = {
    fields: ['name'],
    fieldsAlias: { name: 'Name' },
    uid: 'id',
  }

  it('renders rows with the same field output', async () => {
    render(
      <DataTableContent
        {...baseProps}
        controller={{
          rows: [{ id: 1, name: 'Alice' }],
          initialLoading: false,
          loadingMore: false,
          loadMoreError: false,
          retryLoadMore: async () => {},
        }}
      />
    )

    await screen.findByText('Name')
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders row actions', async () => {
    render(
      <DataTableContent
        {...baseProps}
        controller={{
          rows: [{ id: 1, name: 'Alice' }],
          initialLoading: false,
          loadingMore: false,
          loadMoreError: false,
          retryLoadMore: async () => {},
        }}
        rowActions={() => <Text>Action</Text>}
      />
    )

    await screen.findByText('Action')
  })

  it('renders empty state', async () => {
    render(
      <DataTableContent
        {...baseProps}
        emptyText="Nothing here"
        controller={{
          rows: [],
          initialLoading: false,
          loadingMore: false,
          loadMoreError: false,
          retryLoadMore: async () => {},
        }}
      />
    )

    await screen.findByText('Nothing here')
  })

  it('renders loading-more footer', async () => {
    render(
      <DataTableContent
        {...baseProps}
        controller={{
          rows: [{ id: 1, name: 'Alice' }],
          initialLoading: false,
          loadingMore: true,
          loadMoreError: false,
          retryLoadMore: async () => {},
        }}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Failed to load more data.')).toBeNull()
    })
  })

  it('renders retry footer and calls retryLoadMore', async () => {
    const retryLoadMore = jest.fn(async () => undefined)

    render(
      <DataTableContent
        {...baseProps}
        controller={{
          rows: [{ id: 1, name: 'Alice' }],
          initialLoading: false,
          loadingMore: false,
          loadMoreError: true,
          retryLoadMore,
        }}
      />
    )

    await screen.findByText('Failed to load more data.')
    fireEvent.press(screen.getByText('Retry'))

    await waitFor(() => {
      expect(retryLoadMore).toHaveBeenCalledTimes(1)
    })
  })

  it('does not render data-table-flat-list', async () => {
    render(
      <DataTableContent
        {...baseProps}
        controller={{
          rows: [{ id: 1, name: 'Alice' }],
          initialLoading: false,
          loadingMore: false,
          loadMoreError: false,
          retryLoadMore: async () => {},
        }}
      />
    )

    await screen.findByText('Alice')
    expect(screen.queryByTestId('data-table-flat-list')).toBeNull()
  })
})

describe('useDataTableExternalScroll', () => {
  function triggerScroll(event: {
    layoutMeasurement: { height: number }
    contentOffset: { y: number }
    contentSize: { height: number }
  }) {
    fireEvent.scroll(screen.getByTestId('external-scroll'), { nativeEvent: event })
  }

  it('does not call loadMore when far from bottom', () => {
    const loadMore = jest.fn(async () => undefined)

    render(<ExternalScrollHarness controller={{ canLoadMore: true, loadMore }} />)

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 100 },
      contentSize: { height: 1000 },
    })

    expect(loadMore).not.toHaveBeenCalled()
  })

  it('calls loadMore when within threshold', () => {
    const loadMore = jest.fn(async () => undefined)

    render(<ExternalScrollHarness controller={{ canLoadMore: true, loadMore }} />)

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 600 },
      contentSize: { height: 1000 },
    })

    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('does not call when canLoadMore is false', () => {
    const loadMore = jest.fn(async () => undefined)

    render(<ExternalScrollHarness controller={{ canLoadMore: false, loadMore }} />)

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 600 },
      contentSize: { height: 1000 },
    })

    expect(loadMore).not.toHaveBeenCalled()
  })

  it('uses default threshold of 240', () => {
    const loadMore = jest.fn(async () => undefined)

    render(<ExternalScrollHarness controller={{ canLoadMore: true, loadMore }} />)

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 559 },
      contentSize: { height: 1000 },
    })
    expect(loadMore).not.toHaveBeenCalled()

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 560 },
      contentSize: { height: 1000 },
    })
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('respects custom threshold', () => {
    const loadMore = jest.fn(async () => undefined)

    render(<ExternalScrollHarness controller={{ canLoadMore: true, loadMore }} threshold={100} />)

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 699 },
      contentSize: { height: 1000 },
    })
    expect(loadMore).not.toHaveBeenCalled()

    triggerScroll({
      layoutMeasurement: { height: 200 },
      contentOffset: { y: 700 },
      contentSize: { height: 1000 },
    })
    expect(loadMore).toHaveBeenCalledTimes(1)
  })
})
