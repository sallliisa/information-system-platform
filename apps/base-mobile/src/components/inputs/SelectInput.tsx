import { useEffect, useMemo, useState } from 'react'
import { Pressable, Text } from 'react-native'
import { BaseInput } from './BaseInput'
import type { FormInputComponentProps, SelectOption } from './types'
import { Icon, Popover } from '../base'
import { materialColors } from '../../theme/material'
import { api } from '../../lib/api'

const EMPTY_OPTIONS: SelectOption[] = []
const EMPTY_PARAMS: Record<string, any> = {}
const NOOP_ON_SELECT = () => undefined

async function defaultSelectGetData(getAPI: string, searchParameters: Record<string, any>) {
  const response = await api.dataset(getAPI, { ...(searchParameters || {}) })
  return Array.isArray(response?.data) ? response.data : []
}

function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export function SelectInput({
  field,
  label,
  value,
  onChangeValue,
  onValidationTouch,
  helperMessage,
  enableHelperMessage,
  error,
  disabled = false,
  placeholder = 'Pilih',
  data,
  getAPI = '',
  searchParameters,
  getData,
  defaultToFirst = false,
  pick = 'id',
  view = 'name',
  multi = false,
  asWhole = false,
  transform,
  onSelect,
  clearable = true,
}: FormInputComponentProps) {
  const resolvedData = data ?? EMPTY_OPTIONS
  const resolvedSearchParameters = searchParameters ?? EMPTY_PARAMS
  const resolvedGetData = getData ?? defaultSelectGetData
  const resolvedOnSelect = onSelect ?? NOOP_ON_SELECT

  const [options, setOptions] = useState<SelectOption[]>([])
  const [selected, setSelected] = useState<SelectOption | SelectOption[] | null>(multi ? [] : null)
  const [open, setOpen] = useState(false)

  function isSameValue(left: unknown, right: unknown): boolean {
    if (left === right) return true
    if ((isNil(left) && right === '') || (left === '' && isNil(right))) return true

    const leftIsObject = left != null && typeof left === 'object'
    const rightIsObject = right != null && typeof right === 'object'

    if (leftIsObject || rightIsObject) {
      const leftPicked = leftIsObject ? (left as Record<string, any>)?.[pick] : left
      const rightPicked = rightIsObject ? (right as Record<string, any>)?.[pick] : right
      return String(leftPicked) === String(rightPicked)
    }

    return String(left) === String(right)
  }

  function getCurrentPicked() {
    if (multi) return null
    if (asWhole && value && typeof value === 'object') {
      return (value as Record<string, any>)[pick]
    }
    return value
  }

  function pickSelected(nextOptions: SelectOption[], currentValue: unknown) {
    if (multi) {
      if (Array.isArray(currentValue) && currentValue.length > 0) {
        return nextOptions.filter((item) =>
          currentValue.find(
            (modelItem: any) => String((modelItem && typeof modelItem === 'object' ? modelItem[pick] : modelItem)) === String(item[pick])
          )
        )
      }
      return defaultToFirst && nextOptions[0] ? [nextOptions[0]] : []
    }

    if (currentValue) {
      if (asWhole && typeof currentValue === 'object') {
        return nextOptions.find((item) => String(item[pick]) === String((currentValue as any)?.[pick])) || null
      }
      return nextOptions.find((item) => String(item[pick]) === String(currentValue)) || null
    }

    return defaultToFirst && nextOptions[0] ? nextOptions[0] : null
  }

  function updateModelValue(nextSelected: SelectOption | SelectOption[] | null) {
    if (multi) {
      const currentValue = Array.isArray(value) ? value : []
      const selectedArray = Array.isArray(nextSelected) ? nextSelected : []

      const nextValue = selectedArray.map((item) => {
        const correspondingValue = currentValue.find((modelItem: any) => {
          const modelPick = typeof modelItem === 'object' ? modelItem?.[pick] : modelItem
          return String(modelPick) === String(item[pick])
        })
        if (correspondingValue) return correspondingValue
        return item
      })

      const mappedCurrent = currentValue.map((item: any) => (typeof item === 'object' ? item?.[pick] : item))
      const mappedNext = nextValue.map((item: any) => (typeof item === 'object' ? item?.[pick] : item))

      if (JSON.stringify(mappedCurrent) !== JSON.stringify(mappedNext)) {
        onChangeValue(nextValue)
      }

      resolvedOnSelect(selectedArray)
      return
    }

    const nextValue = asWhole ? nextSelected : (nextSelected as any)?.[pick]

    if (!isSameValue(value, nextValue)) {
      onChangeValue(nextValue)
    }

    resolvedOnSelect(nextSelected as SelectOption | null)
  }

  useEffect(() => {
    if (value != null) return
    if (!multi) return

    onChangeValue([])
    setSelected([])
  }, [multi, onChangeValue, value])

  useEffect(() => {
    let cancelled = false

    async function loadOptions() {
      const loaded = getAPI ? await resolvedGetData(getAPI, resolvedSearchParameters) : resolvedData
      const normalized = Array.isArray(loaded) ? loaded : []

      let nextOptions = normalized
      if (transform) {
        const transformedData = JSON.parse(JSON.stringify(normalized))
        const transformEntries = Object.entries(transform)
        transformedData.forEach((item: Record<string, any>) => {
          transformEntries.forEach(([sourceKey, targetKey]) => {
            item[targetKey] = item[sourceKey]
            delete item[sourceKey]
          })
        })
        nextOptions = transformedData
      }

      if (cancelled) return

      setOptions(nextOptions)

      const hadValue = value != null && (Array.isArray(value) ? value.length > 0 : true)
      const nextSelected = pickSelected(nextOptions, value)
      setSelected(nextSelected)

      if (!hadValue || multi) {
        updateModelValue(nextSelected)
      }
    }

    void loadOptions()

    return () => {
      cancelled = true
    }
  }, [resolvedData, getAPI, resolvedGetData, multi, pick, resolvedSearchParameters, transform, value, asWhole, defaultToFirst])

  useEffect(() => {
    setSelected(pickSelected(options, value))
  }, [asWhole, defaultToFirst, multi, options, pick, value])

  const displayValue = useMemo(() => {
    if (multi) {
      const selectedItems = Array.isArray(selected) ? selected : []
      if (!selectedItems.length) return ''

      const joined = selectedItems
        .slice(0, 2)
        .map((item) => String(item?.[view] ?? ''))
        .join(', ')

      if (selectedItems.length > 2) {
        return `${joined}, dan ${selectedItems.length - 2} lainnya`
      }

      return joined
    }

    if (selected != null && typeof selected === 'object' && !Array.isArray(selected)) {
      return String((selected as Record<string, any>)?.[view] ?? '')
    }

    return ''
  }, [multi, selected, view])

  function isSelected(item: SelectOption) {
    if (multi) {
      const selectedItems = Array.isArray(selected) ? selected : []
      return selectedItems.map((selectedItem) => selectedItem[pick]).includes(item[pick])
    }

    return String(getCurrentPicked()) === String(item[pick])
  }

  function handleItemPress(item: SelectOption, handleValidationTouch: () => void) {
    if (disabled) return

    if (!multi) {
      setSelected(item)
      setOpen(false)
      updateModelValue(item)
      handleValidationTouch()
      return
    }

    const currentSelected = Array.isArray(selected) ? selected : []
    const nextSelected = currentSelected.map((selectedItem) => selectedItem[pick]).includes(item[pick])
      ? currentSelected.filter((selectedItem) => selectedItem[pick] !== item[pick])
      : [...currentSelected, item]

    setSelected(nextSelected)
    updateModelValue(nextSelected)
    handleValidationTouch()
  }

  function handleClear(handleValidationTouch: () => void) {
    if (disabled) return

    if (!multi) {
      setSelected(null)
      setOpen(false)
      onChangeValue(null)
    } else {
      setSelected([])
      onChangeValue(null)
    }

    handleValidationTouch()
  }

  const showClearAction = !disabled && clearable && Boolean(value)

  return (
    <BaseInput
      field={field}
      label={label}
      error={error}
      helperMessage={helperMessage}
      enableHelperMessage={enableHelperMessage ?? false}
      onValidationTouch={onValidationTouch}
    >
      {({ onValidationTouch: handleValidationTouch }) => (
        <Popover
          disabled={disabled}
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          align="start"
          width="full"
          maxHeight={320}
          contentContainerStyle={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: materialColors.outlineVariant,
            backgroundColor: materialColors.surfaceContainer,
          }}
        >
          <Popover.Trigger>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label || field}
              accessibilityState={{ disabled, expanded: open }}
              disabled={disabled}
              onPress={() => setOpen(true)}
              className="w-full flex-row items-center gap-2 rounded-lg px-4 py-3"
              style={{
                borderWidth: 1,
                borderColor: materialColors.outlineVariant,
                backgroundColor: disabled ? materialColors.surfaceContainerHigh : undefined,
                opacity: disabled ? 0.65 : 1,
              }}
            >
              {displayValue ? (
                <Text numberOfLines={1} className="flex-1" style={{ color: materialColors.onSurface }}>
                  {displayValue}
                </Text>
              ) : (
                <Text numberOfLines={1} className="flex-1" style={{ color: materialColors.onSurfaceVariant }}>
                  {placeholder}
                </Text>
              )}

              {showClearAction ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${field}-clear`}
                  onPress={(event) => {
                    event?.stopPropagation?.()
                    handleClear(handleValidationTouch)
                  }}
                >
                  <Icon name="close" />
                </Pressable>
              ) : (
                <Icon accessibilityLabel={`${field}-arrow`} name="arrow-down-s" />
              )}
            </Pressable>
          </Popover.Trigger>

          <Popover.Content>
            {options.length ? (
              options.map((item, index) => {
                const itemLabel = String(item?.[view] ?? '')
                const selectedItem = isSelected(item)

                return (
                  <Pressable
                    key={`${String(item?.[pick] ?? index)}-${index}`}
                    testID={`select-option-${field}-${index}`}
                    onPress={() => handleItemPress(item, handleValidationTouch)}
                    className="flex-row items-center justify-between gap-3 px-3 py-2"
                    style={{
                      backgroundColor: materialColors.surfaceContainer,
                    }}
                  >
                    <Text className="flex-1" style={{ color: materialColors.onSurface }}>
                      {itemLabel}
                    </Text>
                    <Icon name="check" style={{ opacity: selectedItem ? 1 : 0 }} />
                  </Pressable>
                )
              })
            ) : (
              <Text className="px-2 py-1 text-xs" style={{ color: materialColors.onSurfaceVariant }}>
                Tidak ada data
              </Text>
            )}
          </Popover.Content>
        </Popover>
      )}
    </BaseInput>
  )
}

export type { FormInputComponentProps as FormSelectInputProps }
