import type { TextInputProps as RNTextInputProps } from 'react-native'
import { StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native'
import { materialColors } from '../../theme/material'

type FormTextInputProps = {
  field: string
  label: string
  value: unknown
  onChangeValue: (nextValue: string) => void
  onValidationTouch?: () => void
  helperText?: string
  errorText?: string
  required?: boolean
  disabled?: boolean
  inputProps?: Omit<RNTextInputProps, 'value' | 'onChangeText' | 'editable' | 'onBlur'>
}

function normalizeInputValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function TextInput({
  field,
  label,
  value,
  onChangeValue,
  onValidationTouch,
  helperText,
  errorText,
  required = false,
  disabled = false,
  inputProps,
}: FormTextInputProps) {
  const hasError = Boolean(errorText)
  const multiline = Boolean(inputProps?.multiline)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <RNTextInput
        accessibilityLabel={label || field}
        {...inputProps}
        editable={!disabled}
        value={normalizeInputValue(value)}
        onChangeText={onChangeValue}
        onBlur={onValidationTouch}
        placeholderTextColor={materialColors.onSurfaceVariant}
        style={[
          styles.input,
          multiline ? styles.inputMultiline : null,
          hasError ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
          inputProps?.style,
        ]}
      />

      {hasError ? <Text style={styles.errorText}>{errorText}</Text> : helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: materialColors.onSurface,
  },
  required: {
    color: materialColors.error,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: materialColors.onSurface,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: materialColors.surfaceContainerHigh,
    color: materialColors.onSurfaceVariant,
  },
  inputError: {
    borderColor: materialColors.error,
  },
  helperText: {
    fontSize: 12,
    color: materialColors.onSurfaceVariant,
  },
  errorText: {
    fontSize: 12,
    color: materialColors.error,
  },
})

export type { FormTextInputProps }
