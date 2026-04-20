import Icon from 'react-native-remix-icon'
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type MutableRefObject } from 'react'
import { Keyboard, Pressable, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { materialColors } from '../../theme/material'

type SearchBoxProps = {
  value?: string
  onChangeText?: (value: string) => void
  debounced?: boolean
  placeholder?: string
  className?: string
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  onFocus?: ComponentProps<typeof TextInput>['onFocus']
  onBlur?: ComponentProps<typeof TextInput>['onBlur']
}

export const SearchBox = forwardRef<TextInput, SearchBoxProps>(function SearchBox(
  {
    value = '',
    onChangeText,
    debounced = true,
    placeholder = 'Cari...',
    className,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
  },
  ref
) {
  const inputRef = useRef<TextInput | null>(null)
  const [draft, setDraft] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (!onChangeText) return

    if (!debounced) {
      onChangeText(draft)
      return
    }

    const timeoutId = setTimeout(() => {
      onChangeText(draft)
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [debounced, draft, onChangeText])

  const resolvedClassName = useMemo(
    () => ['flex-row items-center', className].filter(Boolean).join(' '),
    [className]
  )

  const setInputRefs = useCallback(
    (node: TextInput | null) => {
      inputRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as MutableRefObject<TextInput | null>).current = node
      }
    },
    [ref]
  )

  const closeSearch = useCallback(() => {
    setIsFocused(false)
    inputRef.current?.blur()
    Keyboard.dismiss()
  }, [])

  return (
    <View className={resolvedClassName} style={{ columnGap: 8 }}>
      <View
        className="min-h-[52px] flex-1 flex-row items-center rounded-full border px-3.5"
        style={[
          {
            backgroundColor: materialColors.surfaceContainer,
            borderColor: materialColors.outlineVariant,
            columnGap: 8,
          },
          containerStyle,
        ]}
      >
        <Icon name="search-line" size={18} color={materialColors.onSurfaceVariant} fallback={null} />
        <TextInput
          ref={setInputRefs}
          className="flex-1 text-sm"
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={materialColors.onSurfaceVariant}
          style={[{ color: materialColors.onSurface }, inputStyle]}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            onBlur?.(event)
          }}
        />
        {draft ? (
          <Pressable onPress={() => setDraft('')}>
            <Icon name="close-line" size={18} color={materialColors.onSurfaceVariant} fallback={null} />
          </Pressable>
        ) : null}
      </View>
      {isFocused ? (
        <Pressable
          className="h-[52px] w-[52px] items-center justify-center rounded-full"
          style={{
            backgroundColor: materialColors.surfaceContainer,
            borderWidth: 1,
            borderColor: materialColors.outlineVariant,
          }}
          onPress={closeSearch}
        >
          <Icon name="close-line" size={24} color={materialColors.onSurfaceVariant} fallback={null} />
        </Pressable>
      ) : null}
    </View>
  )
})
