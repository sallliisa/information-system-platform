import { fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { FormValidationContext, type FormValidationContextValue } from '../../composites/Form/form.context'
import { BaseInput } from '../BaseInput'

function createContextValue(overrides: Partial<FormValidationContextValue> = {}): FormValidationContextValue {
  return {
    formData: {},
    fieldErrors: {},
    fieldTouched: {},
    submitAttempted: false,
    inputConfig: {},
    validateField: () => '',
    validateVisibleFields: () => false,
    clearFieldValidation: () => undefined,
    touchField: () => undefined,
    ...overrides,
  }
}

function renderWithContext({
  context,
  field = 'name',
  label = 'Name',
  helperMessage = '',
  enableHelperMessage = false,
  error = '',
}: {
  context: FormValidationContextValue
  field?: string
  label?: string
  helperMessage?: string
  enableHelperMessage?: boolean
  error?: string
}) {
  return render(
    <FormValidationContext.Provider value={context}>
      <BaseInput
        field={field}
        label={label}
        helperMessage={helperMessage}
        enableHelperMessage={enableHelperMessage}
        error={error}
      >
        {({ onValidationTouch }) => (
          <Pressable testID="touch-control" onPress={onValidationTouch}>
            <Text>Control</Text>
          </Pressable>
        )}
      </BaseInput>
    </FormValidationContext.Provider>
  )
}

describe('BaseInput', () => {
  it('shows required mark when validation includes required', () => {
    renderWithContext({
      context: createContextValue({
        inputConfig: {
          name: {
            type: 'text',
            props: {
              required: true,
            },
          },
        },
      }),
    })

    expect(screen.getByText(/\*/)).toBeTruthy()
  })

  it('shows helper when enabled and there is no active error', () => {
    renderWithContext({
      context: createContextValue(),
      helperMessage: 'Use your full name',
      enableHelperMessage: true,
    })

    expect(screen.getByText('Use your full name')).toBeTruthy()
  })

  it('does not show helper by default when helper toggle is not enabled', () => {
    renderWithContext({
      context: createContextValue(),
      helperMessage: 'Use your full name',
    })

    expect(screen.queryByText('Use your full name')).toBeNull()
  })

  it('shows error instead of helper when active error exists', () => {
    renderWithContext({
      context: createContextValue({
        fieldErrors: { name: 'Harus diisi!' },
        fieldTouched: { name: true },
      }),
      helperMessage: 'Use your full name',
      enableHelperMessage: true,
    })

    expect(screen.getByText('Harus diisi!')).toBeTruthy()
    expect(screen.queryByText('Use your full name')).toBeNull()
  })

  it('hides untouched validation error until touched or submit', () => {
    renderWithContext({
      context: createContextValue({
        fieldErrors: { name: 'Harus diisi!' },
      }),
      helperMessage: 'Use your full name',
      enableHelperMessage: true,
    })

    expect(screen.queryByText('Harus diisi!')).toBeNull()
    expect(screen.getByText('Use your full name')).toBeTruthy()
  })

  it('supports explicit validation touch callback path', () => {
    const touchField = jest.fn()

    renderWithContext({
      context: createContextValue({
        touchField,
      }),
    })

    fireEvent.press(screen.getByTestId('touch-control'))
    expect(touchField).toHaveBeenCalledWith('name')
  })
})
