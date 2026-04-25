import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { SearchBox } from '../SearchBox'

describe('SearchBox', () => {
  it('renders default placeholder', () => {
    const onChangeValue = jest.fn()

    render(<SearchBox value="" onChangeValue={onChangeValue} />)

    expect(screen.getByPlaceholderText('Cari...')).toBeTruthy()
  })

  it('emits immediately when debounced is false', () => {
    const onChangeValue = jest.fn()

    render(<SearchBox value="" onChangeValue={onChangeValue} debounced={false} />)

    fireEvent.changeText(screen.getByPlaceholderText('Cari...'), 'alice')

    expect(onChangeValue).toHaveBeenCalledWith('alice')
    expect(onChangeValue).toHaveBeenCalledTimes(1)
  })

  it('emits after 300ms when debounced is true', () => {
    jest.useFakeTimers()
    const onChangeValue = jest.fn()

    render(<SearchBox value="" onChangeValue={onChangeValue} />)

    fireEvent.changeText(screen.getByPlaceholderText('Cari...'), 'a')
    fireEvent.changeText(screen.getByPlaceholderText('Cari...'), 'al')
    fireEvent.changeText(screen.getByPlaceholderText('Cari...'), 'ali')

    expect(onChangeValue).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(299)
    })
    expect(onChangeValue).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onChangeValue).toHaveBeenCalledWith('ali')
    expect(onChangeValue).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('syncs input value when external value changes', () => {
    const onChangeValue = jest.fn()
    const { rerender } = render(<SearchBox value="foo" onChangeValue={onChangeValue} />)

    rerender(<SearchBox value="bar" onChangeValue={onChangeValue} />)

    expect(screen.getByDisplayValue('bar')).toBeTruthy()
  })
})
