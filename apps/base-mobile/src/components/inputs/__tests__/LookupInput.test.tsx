import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { LookupInput } from '../LookupInput'
import { api } from '../../../lib/api'

type MockModalProps = {
  open?: boolean
  onOpenChange?: (next: boolean) => void
  onClose?: () => void
  disabled?: boolean
  snapPoints?: Array<string | number>
  contentScrollProps?: Record<string, any>
  children?: ReactNode
}

let latestModalProps: MockModalProps | null = null

jest.mock('../../../lib/api', () => ({
  api: {
    dataset: jest.fn(),
    detail: jest.fn(),
  },
}))

jest.mock('../../base', () => {
  const React = require('react')
  const { ScrollView: RNScrollView, View: RNView } = require('react-native')
  const actual = jest.requireActual('../../base')

  function renderSlot(slot: any, context: any) {
    if (typeof slot === 'function') {
      return slot(context)
    }
    return slot ?? null
  }

  function parseSlots(children: any) {
    let trigger: any
    let header: any
    let content: any
    let footer: any

    React.Children.forEach(children, (child: any) => {
      if (!React.isValidElement(child)) return

      const taggedType = child.type as any
      const slot = taggedType.__slot
      const slotChildren = child.props.children

      if (slot === 'trigger') trigger = slotChildren
      if (slot === 'header') header = slotChildren
      if (slot === 'content') content = slotChildren
      if (slot === 'footer') footer = slotChildren
    })

    return { trigger, header, content, footer }
  }

  const ModalTrigger = Object.assign(function ModalTrigger({ children }: { children?: any }) {
    return <>{children ?? null}</>
  }, { __slot: 'trigger' as const })

  const ModalHeader = Object.assign(function ModalHeader({ children }: { children?: any }) {
    return <>{children ?? null}</>
  }, { __slot: 'header' as const })

  const ModalContent = Object.assign(function ModalContent({ children }: { children?: any }) {
    return <>{children ?? null}</>
  }, { __slot: 'content' as const })

  const ModalFooter = Object.assign(function ModalFooter({ children }: { children?: any }) {
    return <>{children ?? null}</>
  }, { __slot: 'footer' as const })

  function MockModal(props: MockModalProps) {
    latestModalProps = props

    const previousOpenRef = React.useRef(Boolean(props.open))

    React.useEffect(() => {
      if (previousOpenRef.current && !props.open) {
        props.onClose?.()
      }
      previousOpenRef.current = Boolean(props.open)
    }, [props.open, props.onClose])

    const { trigger, header, content, footer } = parseSlots(props.children)

    const setOpen = (next: boolean) => {
      if (next && props.disabled) return
      props.onOpenChange?.(next)
      if (!next) {
        props.onClose?.()
      }
    }

    const context = {
      open: Boolean(props.open),
      setOpen,
      disabled: Boolean(props.disabled),
    }

    return (
      <RNView>
        {renderSlot(trigger, context)}

        {props.open ? (
          <RNView testID="lookup-modal-root">
            <RNView testID="lookup-modal-header">{renderSlot(header, context)}</RNView>
            <RNScrollView testID="lookup-modal-scroll" {...(props.contentScrollProps || {})}>
              {renderSlot(content, context)}
            </RNScrollView>
            <RNView testID="lookup-modal-footer">{renderSlot(footer, context)}</RNView>
          </RNView>
        ) : null}
      </RNView>
    )
  }

  const Modal = Object.assign(MockModal, {
    Trigger: ModalTrigger,
    Header: ModalHeader,
    Content: ModalContent,
    Footer: ModalFooter,
  })

  return {
    ...actual,
    Modal,
    ModalTrigger,
    ModalHeader,
    ModalContent,
    ModalFooter,
  }
})

describe('LookupInput', () => {
  const datasetMock = api.dataset as jest.Mock
  const detailMock = api.detail as jest.Mock

  const firstPageRows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]

  beforeEach(() => {
    latestModalProps = null
    jest.clearAllMocks()
    datasetMock.mockResolvedValue({ data: firstPageRows, totalPage: 1, total: firstPageRows.length })
    detailMock.mockResolvedValue(null)
  })

  function renderLookup(overrides: Record<string, any> = {}) {
    const onChangeValue = overrides.onChangeValue || jest.fn()
    const onValidationTouch = overrides.onValidationTouch || jest.fn()

    render(
      <LookupInput
        field="customer"
        label="Customer"
        value={null}
        onChangeValue={onChangeValue}
        onValidationTouch={onValidationTouch}
        getAPI="/customers"
        {...overrides}
      />
    )

    return {
      onChangeValue,
      onValidationTouch,
    }
  }

  async function openModal() {
    fireEvent.press(screen.getByTestId('lookup-trigger-customer'))

    await waitFor(() => {
      expect(screen.getByTestId('lookup-modal-root')).toBeTruthy()
    })
  }

  it('shows placeholder and opens modal', async () => {
    renderLookup()

    expect(screen.getByText('Pilih')).toBeTruthy()

    await openModal()

    expect(screen.getByTestId('lookup-modal-header')).toBeTruthy()
  })

  it('passes a single max-height snap point to Modal', () => {
    renderLookup()

    expect(latestModalProps?.snapPoints).toEqual(['95%'])
    expect(latestModalProps?.snapPoints).toHaveLength(1)
  })

  it('first page load uses active default params with page and limit', async () => {
    renderLookup()

    await waitFor(() => {
      expect(datasetMock).toHaveBeenCalledWith('/customers', {
        active: true,
        page: '1',
        limit: 10,
      })
    })
  })

  it('search updates table search params', async () => {
    jest.useFakeTimers()
    renderLookup()

    await openModal()

    fireEvent.changeText(screen.getByPlaceholderText('Cari...'), 'ali')

    jest.advanceTimersByTime(350)

    await waitFor(() => {
      expect(datasetMock).toHaveBeenCalledWith('/customers', {
        active: true,
        search: 'ali',
        page: '1',
        limit: 10,
      })
    })

    jest.useRealTimers()
  })

  it('near-bottom modal scroll triggers loadMore and appends page 2 rows', async () => {
    datasetMock
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Alice' }], totalPage: 2, total: 2 })
      .mockResolvedValueOnce({ data: [{ id: 2, name: 'Bob' }], totalPage: 2, total: 2 })

    renderLookup()

    await openModal()
    await screen.findByText('Alice')

    fireEvent.scroll(screen.getByTestId('lookup-modal-scroll'), {
      nativeEvent: {
        layoutMeasurement: { height: 200 },
        contentOffset: { y: 600 },
        contentSize: { height: 1000 },
      },
    })

    await screen.findByText('Bob')

    expect(datasetMock).toHaveBeenNthCalledWith(2, '/customers', {
      active: true,
      page: '2',
      limit: 10,
    })
  })

  it('single row tap only stages until save', async () => {
    const { onChangeValue } = renderLookup()

    await openModal()
    await screen.findByText('Alice')

    fireEvent.press(screen.getByText('Alice'))

    expect(onChangeValue).not.toHaveBeenCalled()
  })

  it('save commits selected picked value', async () => {
    const { onChangeValue } = renderLookup()

    await openModal()
    await screen.findByText('Alice')

    fireEvent.press(screen.getByText('Alice'))
    fireEvent.press(screen.getByTestId('lookup-save-customer'))

    await waitFor(() => {
      expect(onChangeValue).toHaveBeenCalledWith(1)
    })
  })

  it('single selected row can be toggled off and saved as null', async () => {
    const { onChangeValue } = renderLookup()

    await openModal()
    await screen.findByText('Alice')

    fireEvent.press(screen.getByText('Alice'))
    fireEvent.press(screen.getByText('Alice'))
    fireEvent.press(screen.getByTestId('lookup-save-customer'))

    await waitFor(() => {
      expect(onChangeValue).toHaveBeenCalledWith(null)
    })
  })

  it('multi-select saves selected row objects', async () => {
    const { onChangeValue } = renderLookup({ multi: true, value: [] })

    await openModal()
    await screen.findByText('Alice')

    fireEvent.press(screen.getByText('Alice'))
    fireEvent.press(screen.getByText('Bob'))
    fireEvent.press(screen.getByTestId('lookup-save-customer'))

    await waitFor(() => {
      expect(onChangeValue).toHaveBeenCalledWith([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ])
    })
  })

  it('hydrates existing primitive value via getDetail', async () => {
    detailMock.mockResolvedValue({ data: { id: 7, name: 'Customer 7' } })

    renderLookup({ value: 7 })

    await waitFor(() => {
      expect(detailMock).toHaveBeenCalledWith('/customers', 7, { active: true })
    })

    expect(screen.getByText('Customer 7')).toBeTruthy()
  })

  it('clear emits null for single', async () => {
    const { onChangeValue } = renderLookup({ value: { id: 1, name: 'Alice' } })

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })

    fireEvent.press(screen.getByLabelText('customer-clear'))
    expect(onChangeValue).toHaveBeenCalledWith(null)
  })

  it('clear emits [] for multi', async () => {
    const { onChangeValue } = renderLookup({
      field: 'customer_multi',
      label: 'Customer Multi',
      multi: true,
      value: [{ id: 1, name: 'Alice' }],
    })

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })

    fireEvent.press(screen.getByLabelText('customer_multi-clear'))
    expect(onChangeValue).toHaveBeenCalledWith([])
  })

  it('disabled trigger does not open modal', () => {
    renderLookup({ disabled: true })

    fireEvent.press(screen.getByTestId('lookup-trigger-customer'))

    expect(screen.queryByTestId('lookup-modal-root')).toBeNull()
  })

  it('touches validation after save', async () => {
    const { onValidationTouch } = renderLookup()

    await openModal()
    await screen.findByText('Alice')

    fireEvent.press(screen.getByText('Alice'))
    fireEvent.press(screen.getByTestId('lookup-save-customer'))

    await waitFor(() => {
      expect(onValidationTouch).toHaveBeenCalled()
    })
  })

  it('forwards external scroll handlers into Modal contentScrollProps', () => {
    renderLookup()

    expect(typeof latestModalProps?.contentScrollProps?.onScroll).toBe('function')
    expect(latestModalProps?.contentScrollProps?.scrollEventThrottle).toBe(16)
  })
})
