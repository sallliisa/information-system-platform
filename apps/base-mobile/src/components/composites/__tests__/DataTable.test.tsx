import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { DataTable } from '../DataTable'

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
    const getData = jest
      .fn()
      .mockResolvedValueOnce([{ id: 1, name: 'Alice' }])
      .mockResolvedValueOnce([])

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
