import type { TextInputProps as RNTextInputProps } from 'react-native'
import type { JSX, ReactNode } from 'react'

export type CommonInputProps = {
  field: string
  label: string
  enableHelperMessage?: boolean
  helperMessage?: string
  disabled?: boolean
  error?: string
}

export type TextInputConstraint = 'number' | 'integer' | 'integerString' | 'decimal' | 'text'

export type TextInputSpecificProps = {
  prefix?: string
  suffix?: string
  icon?: string
  type?: string
  placeholder?: string
  constraint?: TextInputConstraint[]
  renderAction?: () => ReactNode
}

export type SelectOption = Record<string, any>

export type SelectInputSpecificProps = {
  placeholder?: string
  data?: SelectOption[]
  getAPI?: string
  searchParameters?: Record<string, any>
  getData?: (getAPI: string, searchParameters: Record<string, any>) => Promise<SelectOption[]>
  defaultToFirst?: boolean
  pick?: string
  view?: string
  multi?: boolean
  asWhole?: boolean
  transform?: Record<string, string>
  onSelect?: (selected: SelectOption | SelectOption[] | null | undefined) => void
  clearable?: boolean
}

export type FormInputControlProps = {
  value: unknown
  onChangeValue: (nextValue: any) => void
  onValidationTouch?: () => void
  inputProps?: Omit<RNTextInputProps, 'value' | 'onChangeText' | 'editable' | 'onBlur'>
}

export type FormInputComponentProps = CommonInputProps & TextInputSpecificProps & SelectInputSpecificProps & FormInputControlProps

export type FormInputComponent = (props: FormInputComponentProps) => JSX.Element
