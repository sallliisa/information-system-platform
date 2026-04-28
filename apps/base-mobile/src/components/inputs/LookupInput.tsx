import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { BaseInput } from './BaseInput'
import type { FormInputComponentProps, LookupOption } from './types'
import { Button, Icon, Modal } from '../base'
import {
  DataTableContent,
  useDataTableController,
  useDataTableExternalScroll,
  type DataTablePageResponse,
} from '../composites/DataTable'
import { SearchBox } from '../composites/SearchBox'
import { api } from '../../lib/api'
import { materialColors } from '../../theme/material'

const EMPTY_PARAMS: Record<string, any> = {}
const DEFAULT_FIELDS = ['name']
const DEFAULT_FIELDS_ALIAS: Record<string, string> = {}
const NOOP_FORM_DATA_SETTER = () => undefined

async function defaultLookupGetData(getAPI: string, searchParameters?: Record<string, any>): Promise<DataTablePageResponse> {
  const response = await api.dataset(getAPI, { active: true, ...(searchParameters || {}) })
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    const typedResponse = response as Record<string, any>
    return {
      data: Array.isArray(typedResponse.data) ? typedResponse.data : [],
      total: typeof typedResponse.total === 'number' ? typedResponse.total : undefined,
      totalPage: typeof typedResponse.totalPage === 'number' ? typedResponse.totalPage : undefined,
    }
  }
  return []
}

async function defaultLookupGetDetail(
  getAPI: string,
  id: string | number,
  searchParameters?: Record<string, any>
): Promise<LookupOption | null | undefined> {
  const response = await api.detail(getAPI, id, { active: true, ...(searchParameters || {}) })
  if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
    return (response as { data?: LookupOption }).data
  }
  return response as LookupOption | null | undefined
}

function defaultLookupDataFormatter(data: LookupOption[], multi: boolean, pick: string) {
  if (multi) return data
  return data[0]?.[pick] ?? null
}

function deepClone<T>(value: T): T {
  if (value == null) return value
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    if (Array.isArray(value)) return [...value] as T
    if (typeof value === 'object') return { ...(value as Record<string, any>) } as T
    return value
  }
}

function isDeepEqual(left: unknown, right: unknown) {
  if (left === right) return true
  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    return false
  }
}

function unwrapDetailResponse(value: unknown): LookupOption | null | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'data' in value) {
    return (value as { data?: LookupOption }).data
  }
  return value as LookupOption | null | undefined
}

function getOptionID(option: LookupOption, pick: string) {
  return option?.[pick]
}

function isSamePicked(left: unknown, right: unknown) {
  return String(left) === String(right)
}

function selectionsHaveSamePickedValues(left: LookupOption[], right: LookupOption[], pick: string) {
  if (left.length !== right.length) return false
  return left.every((leftItem, index) => isSamePicked(leftItem?.[pick], right[index]?.[pick]))
}

export function LookupInput({
  field,
  label,
  value,
  onChangeValue,
  onValidationTouch,
  helperMessage,
  enableHelperMessage,
  error,
  disabled = false,
  getAPI = '',
  searchParameters,
  getData = defaultLookupGetData,
  getDetail = defaultLookupGetDetail,
  multi = false,
  pick = 'id',
  fields,
  fieldsAlias,
  fieldsProxy,
  fieldsDictionary,
  fieldsParse,
  fieldsUnit,
  transform,
  preview,
  placeholder = 'Pilih',
  pageSize = 10,
  clearable = true,
  dataFormatter = defaultLookupDataFormatter,
  onCommit,
  onSelectData,
  formData,
  formDataSetter,
}: FormInputComponentProps) {
  const resolvedFields = fields?.length ? fields : DEFAULT_FIELDS
  const firstDisplayField = resolvedFields[0] || 'name'
  const resolvedFieldsAlias = fieldsAlias ?? DEFAULT_FIELDS_ALIAS
  const resolvedSearchParameters = searchParameters ?? EMPTY_PARAMS
  const resolvedFormDataSetter = formDataSetter ?? NOOP_FORM_DATA_SETTER

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<LookupOption[]>([])
  const [stagedSelected, setStagedSelected] = useState<LookupOption[]>([])
  const [committedSelected, setCommittedSelected] = useState<LookupOption[]>([])
  const [loadingCommit, setLoadingCommit] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)

  const normalizeModelSelection = useCallback(
    (rawValue: unknown): LookupOption[] => {
      if (rawValue == null) return []

      if (multi) {
        if (!Array.isArray(rawValue) || rawValue.length === 0) return []
        return deepClone(rawValue)
      }

      if (typeof rawValue === 'object') {
        return [deepClone(rawValue as LookupOption)]
      }

      return [{ [pick]: rawValue }]
    },
    [multi, pick]
  )

  const applySelectionState = useCallback((nextSelection: LookupOption[]) => {
    const clonedSelection = deepClone(nextSelection)
    setSelected(clonedSelection)
    setStagedSelected(deepClone(clonedSelection))
    setCommittedSelected(deepClone(clonedSelection))
  }, [])

  const formatSelectionForModel = useCallback(
    (selection: LookupOption[]) => {
      let data = deepClone(selection)

      if (transform && data.length) {
        const transformEntries = Object.entries(transform)
        data = data.map((item) => {
          const nextItem = { ...item }
          transformEntries.forEach(([sourceKey, targetKey]) => {
            nextItem[targetKey] = nextItem[sourceKey]
          })
          return nextItem
        })
      }

      if (!data.length) return multi ? [] : null
      return dataFormatter(data, multi, pick, resolvedFields)
    },
    [dataFormatter, multi, pick, resolvedFields, transform]
  )

  const hydrateSingleSelectedData = useCallback(
    async (selection: LookupOption[]) => {
      if (multi) return selection

      const selectedItem = selection[0]
      if (!selectedItem) return selection
      if (selectedItem[firstDisplayField]) return selection

      const selectedID = selectedItem[pick]
      if (selectedID == null || selectedID === '' || !getAPI) return selection

      try {
        const detailData = unwrapDetailResponse(await getDetail(getAPI, selectedID, { active: true, ...resolvedSearchParameters }))
        if (!detailData) return selection
        return [deepClone(detailData)]
      } catch {
        return selection
      }
    },
    [firstDisplayField, getAPI, getDetail, multi, pick, resolvedSearchParameters]
  )

  useEffect(() => {
    let cancelled = false

    async function syncSelectionFromValue() {
      const normalizedSelection = normalizeModelSelection(value)
      const formattedCurrentSelection = formatSelectionForModel(selected)

      if (isDeepEqual(value, formattedCurrentSelection)) return
      if (selectionsHaveSamePickedValues(normalizedSelection, selected, pick)) return
      if (
        !multi &&
        typeof value !== 'object' &&
        selected[0]?.[pick] === value &&
        selected[0]?.[firstDisplayField]
      ) {
        return
      }

      const hydratedSelection = await hydrateSingleSelectedData(normalizedSelection)
      if (cancelled) return
      applySelectionState(hydratedSelection)
    }

    void syncSelectionFromValue()

    return () => {
      cancelled = true
    }
  }, [
    applySelectionState,
    firstDisplayField,
    formatSelectionForModel,
    hydrateSingleSelectedData,
    multi,
    normalizeModelSelection,
    pick,
    value,
  ])

  const tableSearchParameters = useMemo(() => {
    const nextParams: Record<string, any> = {
      active: true,
      ...resolvedSearchParameters,
    }

    if (search.trim()) {
      nextParams.search = search
    }

    return nextParams
  }, [resolvedSearchParameters, search])

  const tableController = useDataTableController({
    getAPI,
    getData,
    searchParameters: tableSearchParameters,
    pageSize,
    infiniteScroll: true,
  })

  const tableScroll = useDataTableExternalScroll({
    controller: tableController,
  })

  const displayValue = useMemo(() => {
    if (!selected.length) return placeholder
    if (preview && !hasChanged) return preview

    if (!multi) {
      return selected[0]?.[firstDisplayField] ? String(selected[0][firstDisplayField]) : `${selected.length} Terpilih`
    }

    const itemNames = selected
      .map((item) => item?.[firstDisplayField])
      .filter((item) => item != null && item !== '')
      .map((item) => String(item))

    if (itemNames.length) {
      const visibleNames = itemNames.slice(0, 2).join(', ')
      if (itemNames.length > 2) return `${visibleNames}, ${itemNames.length - 2} lainnya`
      return visibleNames
    }

    return `${selected.length} Terpilih`
  }, [firstDisplayField, hasChanged, multi, placeholder, preview, selected])

  const hasValue = selected.length > 0
  const showClearAction = !disabled && clearable && hasValue

  const selectedIDs = useMemo(
    () => stagedSelected.map((item) => getOptionID(item, pick)),
    [pick, stagedSelected]
  )

  function resetStagedSelection() {
    setStagedSelected(deepClone(committedSelected))
  }

  function isRowSelected(row: LookupOption) {
    return selectedIDs.some((selectedID) => isSamePicked(selectedID, getOptionID(row, pick)))
  }

  function handleRowPress(row: LookupOption) {
    setHasChanged(true)

    if (!multi) {
      setStagedSelected((currentSelection) => {
        if (currentSelection.length && isSamePicked(currentSelection[0]?.[pick], row[pick])) return []
        return [deepClone(row)]
      })
      return
    }

    setStagedSelected((currentSelection) => {
      const currentIndex = currentSelection.findIndex((item) => isSamePicked(item[pick], row[pick]))
      if (currentIndex === -1) return [...currentSelection, deepClone(row)]
      return currentSelection.filter((_, index) => index !== currentIndex)
    })
  }

  function removeStagedItem(row: LookupOption) {
    setHasChanged(true)
    setStagedSelected((currentSelection) => currentSelection.filter((item) => !isSamePicked(item[pick], row[pick])))
  }

  async function handleSave(handleValidationTouch: () => void) {
    const nextSelection = deepClone(stagedSelected)
    setLoadingCommit(true)

    try {
      await onCommit?.(nextSelection)

      setCommittedSelected(deepClone(nextSelection))
      setSelected(deepClone(nextSelection))
      onChangeValue(formatSelectionForModel(nextSelection))
      onSelectData?.(formData, nextSelection, resolvedFormDataSetter)
      handleValidationTouch()
      setOpen(false)
    } catch {
      // Keep the sheet open and leave the committed value unchanged.
    } finally {
      setLoadingCommit(false)
    }
  }

  function handleClear(handleValidationTouch: () => void) {
    if (disabled) return

    const nextSelection: LookupOption[] = []
    setHasChanged(true)
    setSelected(nextSelection)
    setStagedSelected(nextSelection)
    setCommittedSelected(nextSelection)
    onChangeValue(multi ? [] : null)
    onSelectData?.(formData, nextSelection, resolvedFormDataSetter)
    handleValidationTouch()
  }

  function renderRowActions(row: LookupOption) {
    const selectedRow = isRowSelected(row)

    return (
      <View className="flex-row items-center justify-end">
        <Icon
          name="check"
          color={selectedRow ? materialColors.primary : materialColors.onSurfaceVariant}
          style={{ opacity: selectedRow ? 1 : 0.2 }}
        />
      </View>
    )
  }

  function renderSelectedChips() {
    if (!multi || !stagedSelected.length) return null

    return (
      <View className="flex-row flex-wrap gap-2">
        {stagedSelected.map((item, index) => {
          const labelValue = item?.[firstDisplayField] ?? item?.[pick] ?? index

          return (
            <View
              key={`${String(item?.[pick] ?? index)}-${index}`}
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: materialColors.secondaryContainer }}
            >
              <Text className="text-xs font-semibold" style={{ color: materialColors.onSecondaryContainer }}>
                {String(labelValue)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${field}-remove-selected-${index}`}
                onPress={() => removeStagedItem(item)}
              >
                <Icon name="close" size={14} color={materialColors.onSecondaryContainer} />
              </Pressable>
            </View>
          )
        })}
      </View>
    )
  }

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
        <Modal
          open={open}
          onOpenChange={setOpen}
          onClose={resetStagedSelection}
          disabled={disabled}
          snapPoints={['95%']}
          contentScrollProps={{
            onScroll: tableScroll.onScroll,
            scrollEventThrottle: tableScroll.scrollEventThrottle,
            keyboardShouldPersistTaps: 'handled',
            nestedScrollEnabled: true,
          }}
        >
          <Modal.Trigger>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label || field}
              accessibilityState={{ disabled, expanded: open }}
              disabled={disabled}
              testID={`lookup-trigger-${field}`}
              onPress={() => setOpen(true)}
              className="w-full flex-row items-center gap-2 rounded-lg px-4 py-3"
              style={{
                borderWidth: 1,
                borderColor: materialColors.outlineVariant,
                backgroundColor: disabled ? materialColors.surfaceContainerHigh : undefined,
                opacity: disabled ? 0.65 : 1,
              }}
            >
              <Text
                numberOfLines={1}
                className="flex-1"
                style={{ color: hasValue ? materialColors.onSurface : materialColors.onSurfaceVariant }}
              >
                {displayValue}
              </Text>

              {showClearAction ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${field}-clear`}
                  testID={`lookup-clear-${field}`}
                  onPress={(event) => {
                    event?.stopPropagation?.()
                    handleClear(handleValidationTouch)
                  }}
                >
                  <Icon name="close" />
                </Pressable>
              ) : (
                <Icon accessibilityLabel={`${field}-open`} name="arrow-right-up" />
              )}
            </Pressable>
          </Modal.Trigger>

          <Modal.Header>
            <View className="gap-3">
              <Text className="text-base font-bold" style={{ color: materialColors.onSurface }}>
                {label || field}
              </Text>
              <SearchBox
                testID={`lookup-search-${field}`}
                value={search}
                onChangeValue={setSearch}
              />
            </View>
          </Modal.Header>

          <Modal.Content>
            <View className="gap-3">
              {renderSelectedChips()}
              <DataTableContent
                controller={tableController}
                uid={pick}
                fields={resolvedFields}
                fieldsAlias={resolvedFieldsAlias}
                fieldsProxy={fieldsProxy}
                fieldsDictionary={fieldsDictionary}
                fieldsParse={fieldsParse}
                fieldsUnit={fieldsUnit}
                emptyText="Tidak ada data"
                onPressRow={handleRowPress}
                rowActions={renderRowActions}
              />
            </View>
          </Modal.Content>

          <Modal.Footer>
            <View className="flex-row gap-3">
              <Button
                variant="outlined"
                color="secondary"
                className="flex-1"
                disabled={loadingCommit}
                onPress={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button
                testID={`lookup-save-${field}`}
                className="flex-1"
                disabled={loadingCommit}
                onPress={() => void handleSave(handleValidationTouch)}
              >
                {loadingCommit ? <ActivityIndicator size="small" color={materialColors.onPrimary} /> : 'Simpan'}
              </Button>
            </View>
          </Modal.Footer>
        </Modal>
      )}
    </BaseInput>
  )
}

export type { FormInputComponentProps as FormLookupInputProps }
