import { Text, TextInput as RNTextInput, View } from 'react-native'
import { BaseInput } from './BaseInput'
import type { FormInputComponentProps } from './types'
import { Icon } from '../base'
import { materialColors } from '../../theme/material'

function normalizeInputValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

const CONSTRAINT_REGEX: Record<'number' | 'integer' | 'integerString' | 'decimal' | 'text', RegExp> = {
  number: /^[0-9.]*$/,
  integer: /^[0-9]*$/,
  integerString: /^[0-9]*$/,
  decimal: /^[0-9.]*$/,
  text: /^[a-zA-Z\s]*$/,
}

export function TextInput({
  field,
  label,
  value,
  onChangeValue,
  onValidationTouch,
  helperMessage,
  enableHelperMessage,
  error,
  prefix = '',
  suffix = '',
  icon = '',
  type = 'text',
  placeholder = '',
  constraint = ['decimal', 'text'],
  renderAction,
  disabled = false,
  inputProps,
}: FormInputComponentProps) {
  const resolvedEnableHelperMessage = enableHelperMessage ?? false
  const multiline = Boolean(inputProps?.multiline)

  function handleTextChange(nextValue: string) {
    if (constraint.length === 1) {
      const activeConstraint = constraint[0]
      const constraintRegex = CONSTRAINT_REGEX[activeConstraint]
      if (constraintRegex && !constraintRegex.test(nextValue)) return
    }

    onChangeValue(nextValue)
  }

  return (
    <BaseInput
      field={field}
      label={label}
      error={error}
      helperMessage={helperMessage}
      enableHelperMessage={resolvedEnableHelperMessage}
      onValidationTouch={onValidationTouch}
    >
      {({ activeError, onValidationTouch: handleValidationTouch }) => (
        <View
          className="flex-row items-center gap-4 rounded-lg py-3 pl-4"
          style={{
            borderWidth: 1,
            borderColor: materialColors.outlineVariant,
            backgroundColor: disabled ? materialColors.surfaceContainerHigh : undefined,
            opacity: disabled ? 0.65 : 1,
          }}
        >
          {icon ? <Icon name={icon} /> : null}
          {prefix ? <Text style={{ color: materialColors.onSurface }}>{prefix}</Text> : null}
          <RNTextInput
            accessibilityLabel={label || field}
            {...inputProps}
            editable={!disabled}
            secureTextEntry={inputProps?.secureTextEntry ?? type === 'password'}
            placeholder={inputProps?.placeholder ?? placeholder}
            value={normalizeInputValue(value)}
            onChangeText={handleTextChange}
            onBlur={handleValidationTouch}
            placeholderTextColor={materialColors.onSurfaceVariant}
            className="flex-1 bg-transparent"
            style={[
              {
                color: disabled ? materialColors.onSurfaceVariant : materialColors.onSurface,
              },
              multiline ? { minHeight: 96, textAlignVertical: 'top' } : null,
              inputProps?.style,
            ]}
          />
          {suffix ? <Text style={{ color: materialColors.onSurface }} className="mr-4 min-w-max">{suffix}</Text> : null}
          {renderAction ? <View className="mr-4 max-h-min">{renderAction()}</View> : null}
        </View>
      )}
    </BaseInput>
  )
}

export type { FormInputComponentProps as FormTextInputProps }
