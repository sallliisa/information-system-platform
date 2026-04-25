import { useEffect, useRef, useState } from 'react'
import { TextInput as RNTextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { Icon } from '../base'
import { materialColors } from '../../theme/material'

type SearchBoxProps = {
  value?: string | null
  onChangeValue: (value: string) => void
  debounced?: boolean
  placeholder?: string
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  testID?: string
}

function normalizeInputValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function toRgba(rgbColor: string, alpha: number): string {
  if (!rgbColor.startsWith('rgb(')) return rgbColor
  return rgbColor.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
}

export function SearchBox({
  value,
  onChangeValue,
  debounced = true,
  placeholder = 'Cari...',
  containerStyle,
  inputStyle,
  testID,
}: SearchBoxProps) {
  const externalValueRef = useRef(normalizeInputValue(value))
  const [inputValue, setInputValue] = useState(externalValueRef.current)

  useEffect(() => {
    const nextValue = normalizeInputValue(value)
    externalValueRef.current = nextValue
    setInputValue((currentValue) => (currentValue === nextValue ? currentValue : nextValue))
  }, [value])

  useEffect(() => {
    if (inputValue === externalValueRef.current) return

    if (!debounced) {
      onChangeValue(inputValue)
      return
    }

    const timeoutID = setTimeout(() => {
      onChangeValue(inputValue)
    }, 300)

    return () => clearTimeout(timeoutID)
  }, [debounced, inputValue, onChangeValue])

  return (
    <View
      className="flex-row items-center gap-4 rounded-full py-3 pl-4"
      style={[
        {
          borderWidth: 1,
          borderColor: materialColors.outlineVariant,
          backgroundColor: materialColors.surfaceContainer,
        },
        containerStyle,
      ]}
      testID={testID}
    >
      <Icon name="search" color={materialColors.primary} />
      <RNTextInput
        placeholder={placeholder}
        value={inputValue}
        onChangeText={setInputValue}
        className="flex-1 bg-transparent"
        placeholderTextColor={materialColors.onSurfaceVariant}
        style={[
          {
            color: materialColors.onSurface,
            paddingVertical: 0,
          },
          inputStyle,
        ]}
      />
    </View>
  )
}

export type { SearchBoxProps }
