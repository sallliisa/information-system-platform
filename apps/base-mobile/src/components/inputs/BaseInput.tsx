import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { useFormValidationContext } from '../composites/Form/form.context'
import { hasRequiredValidation } from '../composites/Form/validation'
import { materialColors } from '../../theme/material'

type BaseInputRenderProps = {
  activeError: string
  onValidationTouch: () => void
}

type BaseInputProps = {
  field?: string
  label?: string
  error?: string
  helperMessage?: string
  enableHelperMessage?: boolean
  onValidationTouch?: () => void
  containerStyle?: StyleProp<ViewStyle>
  children: ReactNode | ((props: BaseInputRenderProps) => ReactNode)
}

export function BaseInput({
  field = '',
  label = '',
  error = '',
  helperMessage = '',
  enableHelperMessage = false,
  onValidationTouch,
  containerStyle,
  children,
}: BaseInputProps) {
  const formValidation = useFormValidationContext()

  const requiredMark = useMemo(() => {
    if (!field || !formValidation?.inputConfig?.[field]) return false
    return hasRequiredValidation(formValidation.inputConfig[field])
  }, [field, formValidation])

  const shouldShowValidationError = useMemo(() => {
    if (!formValidation || !field) return false
    return Boolean(formValidation.fieldTouched[field] || formValidation.submitAttempted)
  }, [field, formValidation])

  const activeError = useMemo(() => {
    if (!formValidation || !field) return error
    if (!shouldShowValidationError) return ''
    return formValidation.fieldErrors[field] || ''
  }, [error, field, formValidation, shouldShowValidationError])

  const handleValidationTouch = useCallback(() => {
    if (onValidationTouch) {
      onValidationTouch()
      return
    }

    if (!formValidation || !field) return
    formValidation.touchField(field)
  }, [field, formValidation, onValidationTouch])

  const content =
    typeof children === 'function'
      ? children({
          activeError,
          onValidationTouch: handleValidationTouch,
        })
      : children

  return (
    <View className="gap-1.5" style={containerStyle}>
      {label ? (
        <Text className="text-[13px] font-semibold" style={{ color: materialColors.onSurface }}>
          {label}
          {requiredMark ? <Text style={{ color: materialColors.error }}> *</Text> : null}
        </Text>
      ) : null}

      {content}

      {enableHelperMessage && (helperMessage || activeError) ? (
        <Text className="text-xs" style={{ color: activeError ? materialColors.error : materialColors.onSurfaceVariant }}>
          {activeError || helperMessage}
        </Text>
      ) : null}
    </View>
  )
}

export type { BaseInputProps, BaseInputRenderProps }
