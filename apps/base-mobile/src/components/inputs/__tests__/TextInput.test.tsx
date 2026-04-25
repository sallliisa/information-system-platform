import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { TextInput } from '../TextInput'

describe('TextInput', () => {
  it('renders icon, prefix, suffix, and action when provided', () => {
    render(
      <TextInput
        field="phone"
        label="Phone"
        value=""
        onChangeValue={() => undefined}
        icon="phone"
        prefix="+62"
        suffix="ID"
        renderAction={() => <Text>Action</Text>}
      />
    )

    expect(screen.getByText('+62')).toBeTruthy()
    expect(screen.getByText('ID')).toBeTruthy()
    expect(screen.getByText('Action')).toBeTruthy()
  })

  it('filters invalid value when a single integer constraint is active', () => {
    const onChangeValue = jest.fn()

    render(
      <TextInput
        field="age"
        label="Age"
        value=""
        onChangeValue={onChangeValue}
        constraint={['integer']}
      />
    )

    const input = screen.getByLabelText('Age')
    fireEvent.changeText(input, '123')
    fireEvent.changeText(input, '123a')

    expect(onChangeValue).toHaveBeenCalledTimes(1)
    expect(onChangeValue).toHaveBeenCalledWith('123')
  })

  it('keeps emitting string values under numeric constraints', () => {
    const onChangeValue = jest.fn()

    render(
      <TextInput
        field="total"
        label="Total"
        value=""
        onChangeValue={onChangeValue}
        constraint={['number']}
      />
    )

    fireEvent.changeText(screen.getByLabelText('Total'), '42')

    expect(onChangeValue).toHaveBeenCalledWith('42')
    expect(typeof onChangeValue.mock.calls[0][0]).toBe('string')
  })
})
