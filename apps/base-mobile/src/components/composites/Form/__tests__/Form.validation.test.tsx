import type { InputConfig } from '@repo/model-meta'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { z } from 'zod'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { BaseInput, type FormTextInputProps } from '../../../inputs'
import { Form } from '../Form'

function buildFieldsAlias(fields: string[]) {
  return Object.fromEntries(fields.filter((field) => !field.includes('|')).map((field) => [field, field]))
}

function renderForm({
  fields,
  inputConfig,
  getInitialData,
  onSubmit,
  renderSubmit,
}: {
  fields: string[]
  inputConfig: InputConfig
  getInitialData?: () => Promise<Record<string, any>>
  onSubmit?: (params: any) => Promise<Record<string, any>>
  renderSubmit?: (params: {
    loading: boolean
    submitForm: () => Promise<void>
    formData: Record<string, any>
  }) => ReactNode
}) {
  return render(
    <Form
      fields={fields}
      fieldsAlias={buildFieldsAlias(fields)}
      inputConfig={inputConfig}
      getInitialData={getInitialData || (async () => ({}))}
      onSubmit={onSubmit || (async () => ({}))}
      renderSubmit={renderSubmit}
      targetAPI="mock-api"
    />
  )
}

describe('Form validation integration', () => {
  it('shows no error before first blur and shows after blur', async () => {
    renderForm({
      fields: ['name'],
      inputConfig: {
        name: {
          type: 'text',
          props: { required: true, enableHelperMessage: true },
        },
      },
    })

    const input = await screen.findByLabelText('name')
    expect(screen.queryByText('Harus diisi!')).toBeNull()

    fireEvent(input, 'blur')

    await waitFor(() => {
      expect(screen.getByText('Harus diisi!')).toBeTruthy()
    })
  })

  it('validates untouched visible fields on submit', async () => {
    renderForm({
      fields: ['name'],
      inputConfig: {
        name: {
          type: 'text',
          props: { required: true, enableHelperMessage: true },
        },
      },
    })

    await screen.findByLabelText('name')
    fireEvent.press(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.getByText('Harus diisi!')).toBeTruthy()
    })
  })

  it('skips hidden dependency fields and clears stale errors', async () => {
    const onSubmit = jest.fn(async (_params: any) => ({}))

    renderForm({
      fields: ['show_secret', 'secret'],
      onSubmit,
      getInitialData: async () => ({ show_secret: '', secret: '' }),
      inputConfig: {
        show_secret: {
          type: 'text',
        },
        secret: {
          type: 'text',
          props: { required: true, enableHelperMessage: true },
          dependency: {
            fields: ['show_secret'],
            visibility: {
              default: false,
              validator: ({ show_secret }: Record<string, any>) => show_secret === 'show',
            },
          },
        },
      },
    })

    const triggerInput = await screen.findByLabelText('show_secret')
    fireEvent.changeText(triggerInput, 'show')
    fireEvent(triggerInput, 'blur')

    await screen.findByLabelText('secret')
    fireEvent.press(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.getByText('Harus diisi!')).toBeTruthy()
    })

    fireEvent.changeText(triggerInput, '')
    fireEvent(triggerInput, 'blur')

    await waitFor(() => {
      expect(screen.queryByLabelText('secret')).toBeNull()
    })

    fireEvent.press(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.queryByText('Harus diisi!')).toBeNull()
    })

    expect(onSubmit).toHaveBeenCalled()
    const payload = ((onSubmit as any).mock.calls.at(-1)?.[0]?.payload || {}) as Record<string, any>
    expect(payload.secret).toBeNull()
  })

  it('supports explicit validation touch for non-blur widgets', async () => {
    function TouchOnlyCustomInput({
      field,
      label,
      onValidationTouch,
      helperMessage,
      enableHelperMessage,
      error,
    }: FormTextInputProps) {
      return (
        <BaseInput
          field={field}
          label={label}
          helperMessage={helperMessage}
          enableHelperMessage={enableHelperMessage}
          error={error}
          onValidationTouch={onValidationTouch}
        >
          {({ onValidationTouch: triggerValidationTouch }) => (
            <Pressable accessibilityLabel={`commit-${field}`} onPress={triggerValidationTouch}>
              <Text>Commit</Text>
            </Pressable>
          )}
        </BaseInput>
      )
    }

    renderForm({
      fields: ['custom_field'],
      inputConfig: {
        custom_field: {
          type: 'custom',
          component: TouchOnlyCustomInput as any,
          props: { required: true, enableHelperMessage: true },
        },
      },
    })

    const commitButton = await screen.findByLabelText('commit-custom_field')
    fireEvent.press(commitButton)

    await waitFor(() => {
      expect(screen.getByText('Harus diisi!')).toBeTruthy()
    })
  })

  it('shows warning fallback when custom type has no component', async () => {
    renderForm({
      fields: ['custom_field'],
      inputConfig: {
        custom_field: {
          type: 'custom',
        },
      },
    })

    await screen.findByText('WARN: inputConfig[custom_field].component is undefined')
  })

  it('honors mixed colSpan values and section row breaks', async () => {
    renderForm({
      fields: ['first', 'second', 'third', 'S|Section title', 'fourth'],
      inputConfig: {
        first: { type: 'text', colSpan: 6 },
        second: { type: 'text', colSpan: 6 },
        third: { type: 'text', colSpan: 4 },
        fourth: { type: 'text', colSpan: 12 },
      },
    })

    await screen.findByLabelText('first')

    expect(screen.getByTestId('form-row-0-field-first')).toBeTruthy()
    expect(screen.getByTestId('form-row-0-field-second')).toBeTruthy()
    expect(screen.getByTestId('form-row-1-field-third')).toBeTruthy()
    expect(screen.getByText('Section title')).toBeTruthy()
    expect(screen.getByTestId('form-row-3-field-fourth')).toBeTruthy()

    const firstStyle = StyleSheet.flatten(screen.getByTestId('form-row-0-field-first').props.style)
    const thirdStyle = StyleSheet.flatten(screen.getByTestId('form-row-1-field-third').props.style)
    expect(firstStyle.width).toBe('50%')
    expect(thirdStyle.width).toBe(`${(4 / 12) * 100}%`)
  })

  it('interprets rowSpan without breaking render flow', async () => {
    renderForm({
      fields: ['tall', 'normal'],
      inputConfig: {
        tall: { type: 'text', colSpan: 12, rowSpan: 2 },
        normal: { type: 'text', colSpan: 12 },
      },
    })

    await screen.findByLabelText('tall')
    await screen.findByLabelText('normal')

    const tallStyle = StyleSheet.flatten(screen.getByTestId('form-row-0-field-tall').props.style)
    expect(tallStyle.minHeight).toBe(112)
  })

  it('uses renderSubmit params and suppresses default submit button', async () => {
    const onSubmit = jest.fn(async (_params: any) => ({}))
    const renderSubmit = jest.fn(({ submitForm }: { submitForm: () => Promise<void> }) => (
      <Pressable accessibilityLabel="custom-submit" onPress={() => void submitForm()}>
        <Text>Send</Text>
      </Pressable>
    ))

    renderForm({
      fields: ['name'],
      inputConfig: {
        name: { type: 'text' },
      },
      onSubmit,
      getInitialData: async () => ({ name: 'Ari' }),
      renderSubmit,
    })

    await screen.findByLabelText('name')
    expect(screen.queryByText('Submit')).toBeNull()
    expect(screen.getByLabelText('custom-submit')).toBeTruthy()
    expect(renderSubmit).toHaveBeenCalled()

    const firstCall = renderSubmit.mock.calls[0]?.[0]
    expect(firstCall).toMatchObject({
      loading: false,
      formData: { name: 'Ari' },
    })
    expect(typeof firstCall.submitForm).toBe('function')

    fireEvent.press(screen.getByLabelText('custom-submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('renders default submit button when renderSubmit is absent', async () => {
    renderForm({
      fields: ['name'],
      inputConfig: {
        name: { type: 'text' },
      },
    })

    await screen.findByLabelText('name')
    expect(screen.getByText('Submit')).toBeTruthy()
  })

  it('validates optional zod email only for non-empty values', async () => {
    renderForm({
      fields: ['email'],
      inputConfig: {
        email: {
          type: 'text',
          props: {
            enableHelperMessage: true,
            validation: z.string().email('Format email tidak valid!'),
          },
        },
      },
    })

    const input = await screen.findByLabelText('email')

    fireEvent(input, 'blur')
    await waitFor(() => {
      expect(screen.queryByText('Format email tidak valid!')).toBeNull()
    })

    fireEvent.changeText(input, 'bad')
    fireEvent(input, 'blur')
    await waitFor(() => {
      expect(screen.getByText('Format email tidak valid!')).toBeTruthy()
    })

    fireEvent.changeText(input, 'user.com')
    fireEvent(input, 'blur')
    await waitFor(() => {
      expect(screen.queryByText('Format email tidak valid!')).toBeNull()
    })
  })
})
