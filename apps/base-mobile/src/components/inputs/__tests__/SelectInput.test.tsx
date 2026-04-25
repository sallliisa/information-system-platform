import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Animated } from 'react-native'
import { SelectInput } from '../SelectInput'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: any }) => children,
}))

describe('SelectInput', () => {
  const BASE_OPTIONS = [
    { id: 'active', name: 'Aktif' },
    { id: 'inactive', name: 'Nonaktif' },
    { id: 'draft', name: 'Draft' },
  ]

  beforeEach(() => {
    jest.spyOn(Animated, 'timing').mockImplementation((value: any, config: any) => {
      return {
        start: (callback?: (result: { finished: boolean }) => void) => {
          value.setValue(config.toValue)
          callback?.({ finished: true })
        },
        stop: jest.fn(),
        reset: jest.fn(),
      } as any
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function renderSelect(overrides: Record<string, any> = {}) {
    const onChangeValue = overrides.onChangeValue || jest.fn()
    const onValidationTouch = overrides.onValidationTouch || jest.fn()

    render(
      <SelectInput
        field="status"
        label="Status"
        value={''}
        onChangeValue={onChangeValue}
        onValidationTouch={onValidationTouch}
        data={BASE_OPTIONS}
        {...overrides}
      />
    )

    return { onChangeValue, onValidationTouch }
  }

  async function openPopover() {
    fireEvent.press(screen.getByLabelText('Status'))

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeTruthy()
    })

    fireEvent(screen.getByTestId('popover-trigger-anchor'), 'layout', {
      nativeEvent: { layout: { x: 20, y: 120, width: 260, height: 44 } },
    })

    fireEvent(screen.getByTestId('popover-content'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 220 } },
    })
  }

  it('renders placeholder, opens popover, selects item, emits picked value, touches validation, and closes', async () => {
    const { onChangeValue, onValidationTouch } = renderSelect({ value: null })

    expect(screen.getByText('Pilih')).toBeTruthy()

    await openPopover()
    fireEvent.press(screen.getByText('Aktif'))

    expect(onChangeValue).toHaveBeenCalledWith('active')
    expect(onValidationTouch).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.queryByTestId('popover-modal')).toBeNull()
    })
  })

  it('displays matching option label for existing primitive value', () => {
    renderSelect({ value: 'inactive' })

    expect(screen.getByText('Nonaktif')).toBeTruthy()
  })

  it('emits whole object when asWhole is enabled', async () => {
    const { onChangeValue } = renderSelect({ value: null, asWhole: true })

    await openPopover()
    fireEvent.press(screen.getByText('Aktif'))

    expect(onChangeValue).toHaveBeenCalledWith({ id: 'active', name: 'Aktif' })
  })

  it('clear action emits null and touches validation', () => {
    const { onChangeValue, onValidationTouch } = renderSelect({ value: 'active' })

    fireEvent.press(screen.getByLabelText('status-clear'))

    expect(onChangeValue).toHaveBeenCalledWith(null)
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('shows arrow instead of clear action when clearable is false', () => {
    renderSelect({ value: 'active', clearable: false })

    expect(screen.queryByLabelText('status-clear')).toBeNull()
    expect(screen.getByLabelText('status-arrow')).toBeTruthy()
  })

  it('toggles multi-selected items and emits array payload', async () => {
    const { onChangeValue } = renderSelect({ value: [], multi: true })

    await openPopover()
    fireEvent.press(screen.getByText('Aktif'))
    fireEvent.press(screen.getByText('Nonaktif'))
    fireEvent.press(screen.getByText('Aktif'))

    expect(onChangeValue).toHaveBeenLastCalledWith([{ id: 'inactive', name: 'Nonaktif' }])
  })

  it('summarizes multi display after two selected labels', () => {
    renderSelect({
      value: [
        { id: 'active', name: 'Aktif' },
        { id: 'inactive', name: 'Nonaktif' },
        { id: 'draft', name: 'Draft' },
      ],
      multi: true,
    })

    expect(screen.getByText('Aktif, Nonaktif, dan 1 lainnya')).toBeTruthy()
  })

  it('defaults to first option when defaultToFirst is true and value is empty', async () => {
    const { onChangeValue } = renderSelect({ value: null, defaultToFirst: true })

    await waitFor(() => {
      expect(onChangeValue).toHaveBeenCalledWith('active')
    })
  })

  it('applies transform mapping before display and pick value extraction', async () => {
    const onChangeValue = jest.fn()

    renderSelect({
      value: null,
      onChangeValue,
      data: [{ code: 'A', label: 'Pilihan A' }],
      transform: { code: 'id', label: 'name' },
    })

    await openPopover()
    fireEvent.press(screen.getByText('Pilihan A'))

    expect(onChangeValue).toHaveBeenCalledWith('A')
  })

  it('renders empty-data fallback text', async () => {
    renderSelect({ data: [], value: null })

    await openPopover()

    expect(screen.getByText('Tidak ada data')).toBeTruthy()
  })

  it('does not open or emit changes when disabled', () => {
    const { onChangeValue } = renderSelect({ disabled: true, value: '' })
    onChangeValue.mockClear()

    fireEvent.press(screen.getByLabelText('Status'))

    expect(screen.queryByTestId('popover-content')).toBeNull()
    expect(onChangeValue).not.toHaveBeenCalled()
  })

  it('loads options through getData(getAPI, searchParameters)', async () => {
    const getData = jest.fn(async () => [{ id: 'x', name: 'Pilihan API' }])

    renderSelect({
      value: null,
      data: [],
      getAPI: '/master/status',
      searchParameters: { active: true },
      getData,
    })

    await waitFor(() => {
      expect(getData).toHaveBeenCalledWith('/master/status', { active: true })
    })

    await openPopover()

    expect(screen.getByText('Pilihan API')).toBeTruthy()
  })
})
