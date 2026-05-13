import type { FieldDependency, InputConfig, ModelFormField } from '@southneuhof/is-data-model'
import { evaluateFieldDependencies } from '@southneuhof/is-data-model'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native'
import { defaultFormConfig } from '../../../configs/_defaults'
import { materialColors } from '../../../theme/material'
import { Card } from '../../base'
import { TextInput, type FileInputSpecificProps, type FormInputComponent, type ImageInputSpecificProps, type LookupInputSpecificProps, type SelectInputSpecificProps, type TextInputConstraint } from '../../inputs'
import {
  componentTypeMap,
  createMergedInputConfig,
  defaultBeforeSubmit,
  defaultFormGetData,
  defaultOnError,
  defaultOnSubmit,
  defaultOnSuccess,
  type FormGetDetailParams,
  type FormMode,
  type FormOnErrorParams,
  type FormOnSubmitParams,
  type FormOnSuccessParams,
} from './form.defaults'
import { FormValidationContext, type FormValidationContextValue } from './form.context'
import { executeValidationRules } from './validation'

type FormRenderSubmitParams = {
  loading: boolean
  submitForm: () => Promise<void>
  formData: Record<string, any>
}

type FormProps = {
  inputConfig?: InputConfig
  fields?: string[]
  fieldsAlias?: Record<string, string>
  getDetailData?: (params: FormGetDetailParams) => Promise<Record<string, any>>
  getInitialData?: () => Promise<Record<string, any>>
  beforeSubmit?: ({ formData }: { formData: Record<string, any> }) => Record<string, any>
  onSubmit?: (params: FormOnSubmitParams) => Promise<Record<string, any> | void>
  onSuccess?: (params: FormOnSuccessParams) => void
  onError?: (params: FormOnErrorParams) => void
  targetAPI?: string
  getAPI?: string
  dataID?: string
  formType?: FormMode
  method?: 'put' | 'post'
  searchParameters?: Record<string, any>
  extraData?: Record<string, any>
  static?: boolean
  disabled?: boolean
  value?: Record<string, any>
  onChange?: (nextValue: Record<string, any>) => void
  submitLabel?: string
  renderSubmit?: (params: FormRenderSubmitParams) => ReactNode
}

type FormStatus = {
  type: 'success' | 'error'
  text: string
}

const EMPTY_OBJECT: Record<string, any> = {}
const DEFAULT_GET_INITIAL_DATA = async () => ({})
const GRID_COLUMNS = 12
const GRID_ROW_SPAN_HEIGHT = 56

const TEXT_INPUT_PROP_KEYS: (keyof RNTextInputProps)[] = [
  'autoCapitalize',
  'autoCorrect',
  'keyboardType',
  'maxLength',
  'multiline',
  'numberOfLines',
  'placeholder',
  'returnKeyType',
  'secureTextEntry',
  'textAlignVertical',
]

function isPlainObject(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false
    for (let i = 0; i < left.length; i += 1) {
      if (!deepEqual(left[i], right[i])) return false
    }
    return true
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    if (leftKeys.length !== rightKeys.length) return false

    for (const key of leftKeys) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) return false
      if (!deepEqual(left[key], right[key])) return false
    }

    return true
  }

  return false
}

function extractErrorMessage(error: unknown): string {
  const candidate = error as { message?: unknown; error?: unknown; statusText?: unknown; data?: unknown }

  if (candidate?.message && typeof candidate.message === 'object') {
    const nested = candidate.message as { message?: unknown }
    if (nested.message) return String(nested.message)
  }

  if (candidate?.data && typeof candidate.data === 'object') {
    const nested = candidate.data as { message?: unknown }
    if (nested.message) return String(nested.message)
  }

  return String(candidate?.message || candidate?.error || candidate?.statusText || 'An unexpected error occurred.')
}

function cloneFieldDependency(dependency: FieldDependency): FieldDependency {
  return {
    fields: [...(dependency.fields || [])],
    visibility: dependency.visibility ? { ...dependency.visibility } : undefined,
    disabled: dependency.disabled ? { ...dependency.disabled } : undefined,
    props: dependency.props
      ? {
          ...dependency.props,
          default: { ...(dependency.props.default || {}) },
          value: dependency.props.value ? { ...(dependency.props.value || {}) } : undefined,
        }
      : undefined,
    inputConfig: dependency.inputConfig
      ? {
          ...dependency.inputConfig,
          default: { ...(dependency.inputConfig.default || {}) },
        }
      : undefined,
    value: dependency.value ? { ...dependency.value } : undefined,
  }
}

function cloneInputConfig(inputConfig: InputConfig): InputConfig {
  const nextConfig: InputConfig = {}

  for (const [field, config] of Object.entries(inputConfig || {})) {
    nextConfig[field] = {
      ...config,
      props: { ...(config.props || {}) },
      dependency: config.dependency ? cloneFieldDependency(config.dependency) : undefined,
      propGenerator: config.propGenerator ? { ...config.propGenerator } : undefined,
    }
  }

  return nextConfig
}

function applyDefaultFieldValues(data: Record<string, any>, inputConfig: InputConfig): Record<string, any> {
  const nextData: Record<string, any> = { ...(data || {}) }

  for (const [field, config] of Object.entries(inputConfig || {})) {
    if (nextData[field] !== undefined) continue
    if (config.props?.defaultValue !== undefined) {
      nextData[field] = config.props.defaultValue
    }
  }

  return nextData
}

function buildDependencyRuntime(inputConfig: InputConfig): Record<string, FieldDependency> {
  const runtime: Record<string, FieldDependency> = {}

  for (const [field, fieldInputConfig] of Object.entries(inputConfig || {})) {
    if (!fieldInputConfig.props) {
      fieldInputConfig.props = {}
    }

    if (!fieldInputConfig.dependency) continue
    runtime[field] = cloneFieldDependency(fieldInputConfig.dependency)
  }

  return runtime
}

function buildTargetData(fields: string[], formData: Record<string, any>): Record<string, any> {
  return Object.fromEntries((fields || []).map((field) => [field, formData[field]]))
}

function isFieldVisible(field: string, dependencyMap: Record<string, FieldDependency>): boolean {
  const visibility = dependencyMap[field]?.visibility
  if (!visibility) return true
  return visibility.value !== false
}

function buildInputProps(fieldType: string, rawProps: Record<string, any>) {
  const inputProps: Partial<RNTextInputProps> = {}

  for (const key of TEXT_INPUT_PROP_KEYS) {
    if (rawProps[key] !== undefined) {
      ;(inputProps as any)[key] = rawProps[key]
    }
  }

  if (fieldType === 'password' && inputProps.secureTextEntry === undefined) {
    inputProps.secureTextEntry = true
  }

  if (fieldType === 'textarea') {
    inputProps.multiline = true
    if (!inputProps.numberOfLines) inputProps.numberOfLines = 4
    if (!inputProps.textAlignVertical) inputProps.textAlignVertical = 'top'
  }

  if ((fieldType === 'number' || fieldType === 'currency') && !inputProps.keyboardType) {
    inputProps.keyboardType = 'numeric'
  }

  const helperMessage = typeof rawProps.helperMessage === 'string' ? rawProps.helperMessage : undefined

  const enableHelperMessage = typeof rawProps.enableHelperMessage === 'boolean' ? rawProps.enableHelperMessage : false

  const type =
    typeof rawProps.type === 'string'
      ? rawProps.type
      : fieldType === 'password'
        ? 'password'
        : fieldType === 'email'
          ? 'email'
          : 'text'

  const placeholder = typeof rawProps.placeholder === 'string' ? rawProps.placeholder : ''
  const prefix = typeof rawProps.prefix === 'string' ? rawProps.prefix : ''
  const suffix = typeof rawProps.suffix === 'string' ? rawProps.suffix : ''
  const icon = typeof rawProps.icon === 'string' ? rawProps.icon : ''

  const constraint = Array.isArray(rawProps.constraint)
    ? (rawProps.constraint.filter((item) => typeof item === 'string') as TextInputConstraint[])
    : (['decimal', 'text'] as TextInputConstraint[])

  const renderAction = typeof rawProps.renderAction === 'function' ? rawProps.renderAction : undefined

  return {
    inputProps,
    helperMessage,
    enableHelperMessage,
    type,
    placeholder,
    prefix,
    suffix,
    icon,
    constraint,
    renderAction,
  }
}

function buildSelectInputProps(rawProps: Record<string, any>): SelectInputSpecificProps {
  return {
    data: Array.isArray(rawProps.data) ? rawProps.data : undefined,
    getAPI: typeof rawProps.getAPI === 'string' ? rawProps.getAPI : undefined,
    searchParameters: isPlainObject(rawProps.searchParameters) ? rawProps.searchParameters : undefined,
    getData: typeof rawProps.getData === 'function' ? rawProps.getData : undefined,
    defaultToFirst: typeof rawProps.defaultToFirst === 'boolean' ? rawProps.defaultToFirst : undefined,
    pick: typeof rawProps.pick === 'string' ? rawProps.pick : undefined,
    view: typeof rawProps.view === 'string' ? rawProps.view : undefined,
    multi: typeof rawProps.multi === 'boolean' ? rawProps.multi : undefined,
    asWhole: typeof rawProps.asWhole === 'boolean' ? rawProps.asWhole : undefined,
    transform: isPlainObject(rawProps.transform) ? rawProps.transform : undefined,
    onSelect: typeof rawProps.onSelect === 'function' ? rawProps.onSelect : undefined,
    clearable: typeof rawProps.clearable === 'boolean' ? rawProps.clearable : undefined,
    placeholder: typeof rawProps.placeholder === 'string' ? rawProps.placeholder : undefined,
  }
}

function buildLookupInputProps(rawProps: Record<string, any>): LookupInputSpecificProps {
  return {
    getAPI: typeof rawProps.getAPI === 'string' ? rawProps.getAPI : undefined,
    searchParameters: isPlainObject(rawProps.searchParameters) ? rawProps.searchParameters : undefined,
    getData: typeof rawProps.getData === 'function' ? rawProps.getData : undefined,
    getDetail: typeof rawProps.getDetail === 'function' ? rawProps.getDetail : undefined,
    multi: typeof rawProps.multi === 'boolean' ? rawProps.multi : undefined,
    pick: typeof rawProps.pick === 'string' ? rawProps.pick : undefined,
    fields: Array.isArray(rawProps.fields) ? rawProps.fields.filter((item) => typeof item === 'string') : undefined,
    fieldsAlias: isPlainObject(rawProps.fieldsAlias) ? rawProps.fieldsAlias : undefined,
    fieldsProxy: isPlainObject(rawProps.fieldsProxy) ? rawProps.fieldsProxy : undefined,
    fieldsDictionary: isPlainObject(rawProps.fieldsDictionary) ? rawProps.fieldsDictionary : undefined,
    fieldsParse: isPlainObject(rawProps.fieldsParse) ? rawProps.fieldsParse : undefined,
    fieldsUnit: isPlainObject(rawProps.fieldsUnit) ? rawProps.fieldsUnit : undefined,
    transform: isPlainObject(rawProps.transform) ? rawProps.transform : undefined,
    preview: typeof rawProps.preview === 'string' ? rawProps.preview : undefined,
    placeholder: typeof rawProps.placeholder === 'string' ? rawProps.placeholder : undefined,
    pageSize: typeof rawProps.pageSize === 'number' ? rawProps.pageSize : undefined,
    clearable: typeof rawProps.clearable === 'boolean' ? rawProps.clearable : undefined,
    dataFormatter: typeof rawProps.dataFormatter === 'function' ? rawProps.dataFormatter : undefined,
    onCommit: typeof rawProps.onCommit === 'function' ? rawProps.onCommit : undefined,
    onSelectData: typeof rawProps.onSelectData === 'function' ? rawProps.onSelectData : undefined,
    formData: rawProps.formData,
    formDataSetter: typeof rawProps.formDataSetter === 'function' ? rawProps.formDataSetter : undefined,
  }
}

function buildImageInputProps(rawProps: Record<string, any>): ImageInputSpecificProps {
  return {
    maxSize: typeof rawProps.maxSize === 'number' ? rawProps.maxSize : undefined,
    disableInformation: typeof rawProps.disableInformation === 'boolean' ? rawProps.disableInformation : undefined,
    multi: typeof rawProps.multi === 'boolean' ? rawProps.multi : undefined,
    limit: typeof rawProps.limit === 'number' ? rawProps.limit : undefined,
    additionalInfo: typeof rawProps.additionalInfo === 'string' ? rawProps.additionalInfo : undefined,
    transform: isPlainObject(rawProps.transform) ? rawProps.transform : undefined,
    uploadPath: typeof rawProps.uploadPath === 'string' ? rawProps.uploadPath : undefined,
  }
}

function buildFileInputProps(rawProps: Record<string, any>): FileInputSpecificProps {
  return {
    accept: Array.isArray(rawProps.accept) ? rawProps.accept.filter((item) => typeof item === 'string') : undefined,
    maxSize: typeof rawProps.maxSize === 'number' ? rawProps.maxSize : undefined,
    multi: typeof rawProps.multi === 'boolean' ? rawProps.multi : undefined,
    uploadPath: typeof rawProps.uploadPath === 'string' ? rawProps.uploadPath : undefined,
  }
}

function computeFieldError({
  field,
  formData,
  inputConfig,
  dependencyMap,
}: {
  field: string
  formData: Record<string, any>
  inputConfig: InputConfig
  dependencyMap: Record<string, FieldDependency>
}): string {
  const activeInputConfig = inputConfig[field]
  if (!activeInputConfig || !isFieldVisible(field, dependencyMap)) {
    return ''
  }

  return executeValidationRules(
    formData[field],
    {
      field,
      formData,
      inputConfig: activeInputConfig,
    },
    activeInputConfig.props?.validation
  )
}

function getFieldDisabled(field: string, dependencyMap: Record<string, FieldDependency>, disabled: boolean) {
  return Boolean(dependencyMap[field]?.disabled?.value) || disabled
}

type FieldLayoutItem = {
  kind: 'field'
  field: string
  index: number
  colSpan: number
  rowSpan: number
}

type SectionLayoutItem = {
  kind: 'section'
  index: number
  field: string
  level: 'S' | 'S1'
  text: string
}

type FormLayoutRow = {
  kind: 'fields'
  items: FieldLayoutItem[]
} | {
  kind: 'section'
  item: SectionLayoutItem
}

function clampColSpan(value: unknown): number {
  const normalized = Number(value)
  if (!Number.isFinite(normalized)) return GRID_COLUMNS
  if (normalized < 1) return 1
  if (normalized > GRID_COLUMNS) return GRID_COLUMNS
  return Math.floor(normalized)
}

function clampRowSpan(value: unknown): number {
  const normalized = Number(value)
  if (!Number.isFinite(normalized) || normalized < 1) return 1
  return Math.floor(normalized)
}

function buildFormLayoutRows(fields: string[], inputConfig: InputConfig): FormLayoutRow[] {
  const rows: FormLayoutRow[] = []
  let currentFieldsRow: FieldLayoutItem[] = []
  let occupiedColumns = 0

  const flushFieldRow = () => {
    if (!currentFieldsRow.length) return
    rows.push({ kind: 'fields', items: currentFieldsRow })
    currentFieldsRow = []
    occupiedColumns = 0
  }

  for (const [index, field] of fields.entries()) {
    if (field.startsWith('S|')) {
      flushFieldRow()
      rows.push({
        kind: 'section',
        item: { kind: 'section', index, field, level: 'S', text: field.slice(2) },
      })
      continue
    }

    if (field.startsWith('S1|')) {
      flushFieldRow()
      rows.push({
        kind: 'section',
        item: { kind: 'section', index, field, level: 'S1', text: field.slice(3) },
      })
      continue
    }

    const fieldConfig = inputConfig[field]
    const colSpan = clampColSpan(fieldConfig?.colSpan ?? fieldConfig?.props?.colSpan)
    const rowSpan = clampRowSpan(fieldConfig?.rowSpan ?? fieldConfig?.props?.rowSpan)

    if (currentFieldsRow.length && occupiedColumns + colSpan > GRID_COLUMNS) {
      flushFieldRow()
    }

    currentFieldsRow.push({ kind: 'field', field, index, colSpan, rowSpan })
    occupiedColumns += colSpan

    if (occupiedColumns >= GRID_COLUMNS) {
      flushFieldRow()
    }
  }

  flushFieldRow()
  return rows
}

export function Form({
  inputConfig: inputConfigProp,
  fields = [],
  fieldsAlias: fieldsAliasProp,
  getDetailData = defaultFormGetData,
  getInitialData = DEFAULT_GET_INITIAL_DATA,
  beforeSubmit = defaultBeforeSubmit,
  onSubmit = defaultOnSubmit,
  onSuccess = defaultOnSuccess,
  onError = defaultOnError,
  targetAPI = '',
  getAPI,
  dataID,
  formType = 'create',
  method,
  searchParameters = EMPTY_OBJECT,
  extraData = EMPTY_OBJECT,
  static: staticMode = false,
  disabled = false,
  value,
  onChange,
  submitLabel = 'Submit',
  renderSubmit,
}: FormProps) {
  const [inputConfigState, setInputConfigState] = useState<InputConfig>({})
  const [fieldDependencyData, setFieldDependencyData] = useState<Record<string, FieldDependency>>({})
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [statusMessage, setStatusMessage] = useState<FormStatus | null>(null)
  const [loading, setLoading] = useState({ get: true, post: false })

  const initializedRef = useRef(false)
  const inputConfigRef = useRef<InputConfig>({})
  const dependencyRef = useRef<Record<string, FieldDependency>>({})
  const formDataRef = useRef<Record<string, any>>({})
  const fieldTouchedRef = useRef<Record<string, boolean>>({})
  const fieldErrorsRef = useRef<Record<string, string>>({})
  const fieldsRef = useRef<string[]>(fields)
  const lastStaticEmitRef = useRef<Record<string, any> | null>(null)

  const fieldsAlias = useMemo(
    () => ({
      ...defaultFormConfig.fieldsAlias,
      ...(fieldsAliasProp || {}),
    }),
    [fieldsAliasProp]
  )

  useEffect(() => {
    fieldsRef.current = fields
  }, [fields])

  useEffect(() => {
    inputConfigRef.current = inputConfigState
  }, [inputConfigState])

  useEffect(() => {
    dependencyRef.current = fieldDependencyData
  }, [fieldDependencyData])

  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  useEffect(() => {
    fieldTouchedRef.current = fieldTouched
  }, [fieldTouched])

  useEffect(() => {
    fieldErrorsRef.current = fieldErrors
  }, [fieldErrors])

  const revalidateDependencies = useCallback(
    (sourceData: Record<string, any>, overrides?: { inputConfig?: InputConfig; dependency?: Record<string, FieldDependency> }) => {
      const currentInputConfig = overrides?.inputConfig || inputConfigRef.current
      const currentDependencyMap = overrides?.dependency || dependencyRef.current
      const dependencyKeys = Object.keys(currentDependencyMap)

      if (!dependencyKeys.length) return

      const evaluatedDependencies = evaluateFieldDependencies(sourceData, currentInputConfig)

      let nextFormData = sourceData
      let formDataChanged = false
      let nextInputConfig = currentInputConfig
      let inputConfigChanged = false
      let dependencyChanged = false

      const nextDependencyMap: Record<string, FieldDependency> = {}

      for (const field of dependencyKeys) {
        const baseDependency = currentDependencyMap[field]
        const runtimeDependency = cloneFieldDependency(baseDependency)
        const fieldInputConfig = (inputConfigChanged ? nextInputConfig : currentInputConfig)[field]
        if (!fieldInputConfig) {
          nextDependencyMap[field] = runtimeDependency
          continue
        }

        const targetData = buildTargetData(runtimeDependency.fields || [], nextFormData)
        const evaluated = evaluatedDependencies[field]

        if (runtimeDependency.value) {
          const computedValue =
            evaluated?.value?.value !== undefined
              ? evaluated.value.value
              : runtimeDependency.value.generator
                ? runtimeDependency.value.generator(targetData)
                : runtimeDependency.value.default

          if (!deepEqual(nextFormData[field], computedValue)) {
            if (!formDataChanged) {
              nextFormData = { ...nextFormData }
              formDataChanged = true
            }
            nextFormData[field] = computedValue
          }
        }

        if (runtimeDependency.visibility) {
          const visibilityValue =
            evaluated?.visibility?.value ??
            (runtimeDependency.visibility.validator
              ? runtimeDependency.visibility.validator(buildTargetData(runtimeDependency.fields || [], nextFormData))
              : runtimeDependency.visibility.default)

          if (runtimeDependency.visibility.value !== visibilityValue) {
            dependencyChanged = true
          }

          runtimeDependency.visibility = {
            ...runtimeDependency.visibility,
            value: visibilityValue,
          }
        }

        if (runtimeDependency.disabled) {
          const disabledValue =
            evaluated?.disabled?.value ??
            (runtimeDependency.disabled.validator
              ? runtimeDependency.disabled.validator(buildTargetData(runtimeDependency.fields || [], nextFormData))
              : runtimeDependency.disabled.default)

          if (runtimeDependency.disabled.value !== disabledValue) {
            dependencyChanged = true
          }

          runtimeDependency.disabled = {
            ...runtimeDependency.disabled,
            value: disabledValue,
          }
        }

        if (runtimeDependency.props) {
          const nextProps = evaluated?.props?.value
            ? {
                ...(runtimeDependency.props.default || {}),
                ...evaluated.props.value,
              }
            : runtimeDependency.props.generator
              ? runtimeDependency.props.generator(buildTargetData(runtimeDependency.fields || [], nextFormData), fieldInputConfig.props)
              : runtimeDependency.props.default

          if (!deepEqual(runtimeDependency.props.value, nextProps)) {
            dependencyChanged = true
          }

          runtimeDependency.props = {
            ...runtimeDependency.props,
            value: { ...(nextProps || {}) },
          }
        }

        if (runtimeDependency.inputConfig) {
          const generatedInputConfig =
            evaluated?.inputConfig?.value ||
            (runtimeDependency.inputConfig.generator
              ? runtimeDependency.inputConfig.generator(buildTargetData(runtimeDependency.fields || [], nextFormData))
              : runtimeDependency.inputConfig.default)

          const mergedFieldInputConfig: ModelFormField = {
            ...fieldInputConfig,
            ...(generatedInputConfig || {}),
            props: {
              ...(fieldInputConfig.props || {}),
              ...((generatedInputConfig?.props as Record<string, any> | undefined) || {}),
            },
          }

          if (!deepEqual(fieldInputConfig, mergedFieldInputConfig)) {
            if (!inputConfigChanged) {
              nextInputConfig = { ...currentInputConfig }
              inputConfigChanged = true
            }
            nextInputConfig[field] = mergedFieldInputConfig
          }
        }

        if (!deepEqual(baseDependency, runtimeDependency)) {
          dependencyChanged = true
        }

        nextDependencyMap[field] = runtimeDependency
      }

      const activeData = formDataChanged ? nextFormData : sourceData
      const activeInputConfig = inputConfigChanged ? nextInputConfig : currentInputConfig
      const activeDependencyMap = dependencyChanged ? nextDependencyMap : currentDependencyMap

      const touchedSnapshot = fieldTouchedRef.current
      const prevErrors = fieldErrorsRef.current
      const nextErrors = { ...prevErrors }
      let errorsChanged = false

      const nextTouched = { ...touchedSnapshot }
      let touchedChanged = false

      for (const field of fieldsRef.current) {
        const visible = isFieldVisible(field, activeDependencyMap)
        if (!visible) {
          if (nextErrors[field]) {
            delete nextErrors[field]
            errorsChanged = true
          }
          if (nextTouched[field]) {
            delete nextTouched[field]
            touchedChanged = true
          }
          continue
        }

        if (!nextTouched[field]) continue
        const error = computeFieldError({
          field,
          formData: activeData,
          inputConfig: activeInputConfig,
          dependencyMap: activeDependencyMap,
        })

        if (error) {
          if (nextErrors[field] !== error) {
            nextErrors[field] = error
            errorsChanged = true
          }
        } else if (nextErrors[field]) {
          delete nextErrors[field]
          errorsChanged = true
        }
      }

      if (inputConfigChanged) {
        inputConfigRef.current = nextInputConfig
        setInputConfigState(nextInputConfig)
      }

      if (dependencyChanged) {
        dependencyRef.current = nextDependencyMap
        setFieldDependencyData(nextDependencyMap)
      }

      if (errorsChanged) {
        fieldErrorsRef.current = nextErrors
        setFieldErrors(nextErrors)
      }

      if (touchedChanged) {
        fieldTouchedRef.current = nextTouched
        setFieldTouched(nextTouched)
      }

      if (formDataChanged) {
        formDataRef.current = nextFormData
        setFormData(nextFormData)
      }
    },
    []
  )

  const validateField = useCallback(
    (field: string, sourceData?: Record<string, any>): string => {
      const activeData = sourceData || formDataRef.current
      const activeInputConfig = inputConfigRef.current
      const activeDependencyMap = dependencyRef.current

      const nextError = computeFieldError({
        field,
        formData: activeData,
        inputConfig: activeInputConfig,
        dependencyMap: activeDependencyMap,
      })

      setFieldErrors((prev) => {
        if (nextError) {
          if (prev[field] === nextError) return prev
          const next = { ...prev, [field]: nextError }
          fieldErrorsRef.current = next
          return next
        }

        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        fieldErrorsRef.current = next
        return next
      })

      return nextError
    },
    []
  )

  const validateVisibleFields = useCallback((): boolean => {
    const activeData = formDataRef.current
    const activeInputConfig = inputConfigRef.current
    const activeDependencyMap = dependencyRef.current

    let hasError = false
    const nextErrors: Record<string, string> = {}

    for (const field of fieldsRef.current) {
      if (!activeInputConfig[field]) continue
      if (!isFieldVisible(field, activeDependencyMap)) continue

      const error = computeFieldError({
        field,
        formData: activeData,
        inputConfig: activeInputConfig,
        dependencyMap: activeDependencyMap,
      })

      if (error) {
        hasError = true
        nextErrors[field] = error
      }
    }

    fieldErrorsRef.current = nextErrors
    setFieldErrors(nextErrors)

    return hasError
  }, [])

  const clearFieldValidation = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      fieldErrorsRef.current = next
      return next
    })

    setFieldTouched((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      fieldTouchedRef.current = next
      return next
    })
  }, [])

  const handleFieldTouch = useCallback(
    (field: string) => {
      setFieldTouched((prev) => {
        if (prev[field]) return prev
        const next = { ...prev, [field]: true }
        fieldTouchedRef.current = next
        return next
      })

      validateField(field)
    },
    [validateField]
  )

  const formValidationContextValue = useMemo<FormValidationContextValue>(
    () => ({
      formData,
      fieldErrors,
      fieldTouched,
      submitAttempted,
      inputConfig: inputConfigState,
      validateField,
      validateVisibleFields,
      clearFieldValidation,
      touchField: handleFieldTouch,
    }),
    [
      clearFieldValidation,
      fieldErrors,
      fieldTouched,
      formData,
      handleFieldTouch,
      inputConfigState,
      submitAttempted,
      validateField,
      validateVisibleFields,
    ]
  )

  useEffect(() => {
    let mounted = true

    async function preflight() {
      initializedRef.current = false
      setLoading((prev) => ({ ...prev, get: true }))
      setStatusMessage(null)

      const mergedInputConfig = cloneInputConfig(createMergedInputConfig(inputConfigProp))
      const dependencyRuntime = buildDependencyRuntime(mergedInputConfig)

      try {
        const initialData = (await getInitialData()) || {}
        let resolvedData = initialData

        if (formType === 'update') {
          const detailData = await getDetailData({
            getAPI: getAPI || '',
            id: dataID,
            searchParameters,
          })
          resolvedData = detailData || {}
        }

        resolvedData = applyDefaultFieldValues(resolvedData, mergedInputConfig)

        if (staticMode) {
          resolvedData = value ? { ...value } : resolvedData
        }

        if (!mounted) return

        inputConfigRef.current = mergedInputConfig
        dependencyRef.current = dependencyRuntime
        formDataRef.current = resolvedData
        fieldTouchedRef.current = {}
        fieldErrorsRef.current = {}

        setInputConfigState(mergedInputConfig)
        setFieldDependencyData(dependencyRuntime)
        setFieldTouched({})
        setFieldErrors({})
        setSubmitAttempted(false)
        setFormData(resolvedData)

        initializedRef.current = true
        revalidateDependencies(resolvedData, {
          inputConfig: mergedInputConfig,
          dependency: dependencyRuntime,
        })
      } catch (error) {
        if (!mounted) return
        setStatusMessage({
          type: 'error',
          text: extractErrorMessage(error),
        })
      } finally {
        if (mounted) {
          setLoading((prev) => ({ ...prev, get: false }))
        }
      }
    }

    void preflight()

    return () => {
      mounted = false
      initializedRef.current = false
    }
  }, [dataID, formType, getAPI, getDetailData, getInitialData, inputConfigProp, revalidateDependencies, searchParameters, staticMode, value])

  useEffect(() => {
    if (!initializedRef.current) return
    revalidateDependencies(formData)
  }, [formData, revalidateDependencies])

  useEffect(() => {
    if (!staticMode) return
    const incomingValue = value || {}
    if (deepEqual(formDataRef.current, incomingValue)) return

    formDataRef.current = incomingValue
    setFormData(incomingValue)
  }, [staticMode, value])

  useEffect(() => {
    if (!staticMode || !onChange) return
    if (lastStaticEmitRef.current && deepEqual(lastStaticEmitRef.current, formData)) return

    lastStaticEmitRef.current = formData
    onChange(formData)
  }, [formData, onChange, staticMode])

  const layoutRows = useMemo(() => buildFormLayoutRows(fields, inputConfigState), [fields, inputConfigState])

  async function submitForm() {
    if (loading.post) return

    setSubmitAttempted(true)
    setStatusMessage(null)

    const hasValidationError = validateVisibleFields()
    if (hasValidationError) {
      setStatusMessage({
        type: 'error',
        text: 'Masih terdapat data yang kosong atau tidak valid.',
      })
      return
    }

    const activeFormData = { ...formDataRef.current }

    for (const field of Object.keys(activeFormData)) {
      if (dependencyRef.current[field]?.visibility?.value === false) {
        activeFormData[field] = null
      }
    }

    const payload = beforeSubmit({ formData: { ...activeFormData, ...extraData } })

    setLoading((prev) => ({ ...prev, post: true }))

    try {
      const response = await onSubmit({
        payload,
        method: method || (formType === 'update' ? 'put' : 'post'),
        targetAPI,
        type: formType,
      })

      onSuccess({
        formData: payload,
        res: (response as Record<string, any>) || {},
      })

      setStatusMessage({
        type: 'success',
        text: 'Data berhasil disimpan.',
      })
    } catch (error) {
      onError({ formData: payload, error })
      setStatusMessage({
        type: 'error',
        text: extractErrorMessage(error),
      })
    } finally {
      setLoading((prev) => ({ ...prev, post: false }))
    }
  }

  function handleFieldChange(field: string, nextValue: any) {
    setFormData((prev) => {
      if (prev[field] === nextValue) return prev
      const next = { ...prev, [field]: nextValue }
      formDataRef.current = next
      return next
    })
  }

  if (loading.get) {
    return (
      <FormValidationContext.Provider value={formValidationContextValue}>
        <View className="items-center justify-center py-7">
          <ActivityIndicator size="small" color={materialColors.primary} />
        </View>
      </FormValidationContext.Provider>
    )
  }

  return (
    <FormValidationContext.Provider value={formValidationContextValue}>
      <View className="gap-2.5">
        {layoutRows.map((row, rowIndex) => {
          if (row.kind === 'section') {
            if (row.item.level === 'S') {
              return (
                <View key={`${row.item.field}-${row.item.index}`} testID={`form-row-${rowIndex}`} className="gap-1.5 mt-1.5">
                  <Text className="text-xs italic" style={{ color: materialColors.primary }}>{row.item.text}</Text>
                  <View className="border-t" style={{ borderTopColor: materialColors.primary }} />
                </View>
              )
            }

            return (
              <Card key={`${row.item.field}-${row.item.index}`} testID={`form-row-${rowIndex}`} type="filled" color="primaryContainer" className="mt-1.5 rounded-xl">
                <Text className="text-base font-bold" style={{ color: materialColors.onPrimaryContainer }}>{row.item.text}</Text>
              </Card>
            )
          }

          return (
            <View key={`row-${rowIndex}`} testID={`form-row-${rowIndex}`} className="-mx-1 flex-row flex-wrap gap-y-2">
              {row.items.map((item) => {
                const field = item.field
                const fieldConfig = inputConfigState[field]
                if (!fieldConfig) {
                  return (
                    <View
                      key={`${field}-${item.index}`}
                      testID={`form-row-${rowIndex}-field-${field}`}
                      className="px-1"
                      style={{ width: `${(item.colSpan / GRID_COLUMNS) * 100}%` }}
                    >
                      <Card type="outlined" color="errorContainer">
                        <Text className="text-xs" style={{ color: materialColors.onErrorContainer }}>WARN: inputConfig[{field}] is undefined</Text>
                      </Card>
                    </View>
                  )
                }

                if (!isFieldVisible(field, fieldDependencyData)) {
                  return null
                }

                const runtimeProps = fieldDependencyData[field]?.props?.value || {}
                const mergedFieldProps = {
                  ...(fieldConfig.props || {}),
                  ...(runtimeProps || {}),
                }

                const MappedComponent = (componentTypeMap[fieldConfig.type] || componentTypeMap.custom || TextInput) as FormInputComponent
                const {
                  inputProps,
                  helperMessage,
                  enableHelperMessage,
                  type,
                  placeholder,
                  prefix,
                  suffix,
                  icon,
                  constraint,
                  renderAction,
                } = buildInputProps(fieldConfig.type, mergedFieldProps)
                const selectInputProps = fieldConfig.type === 'select' ? buildSelectInputProps(mergedFieldProps) : undefined
                const lookupInputProps = fieldConfig.type === 'lookup' ? buildLookupInputProps(mergedFieldProps) : undefined
                const imageInputProps = fieldConfig.type === 'image' ? buildImageInputProps(mergedFieldProps) : undefined
                const fileInputProps = fieldConfig.type === 'file' ? buildFileInputProps(mergedFieldProps) : undefined
                const lookupRuntimeProps = fieldConfig.type === 'lookup'
                  ? {
                      formData,
                      formDataSetter: setFormData,
                    }
                  : undefined
                const fieldDisabled = getFieldDisabled(field, fieldDependencyData, disabled)

                const fieldCellStyle: Record<string, any> = {
                  width: `${(item.colSpan / GRID_COLUMNS) * 100}%`,
                }
                if (item.rowSpan > 1) {
                  fieldCellStyle.minHeight = item.rowSpan * GRID_ROW_SPAN_HEIGHT
                }

                if (fieldConfig.type === 'custom') {
                  const CustomComponent = fieldConfig.component as ((props: Record<string, any>) => ReactNode) | undefined

                  if (!CustomComponent) {
                    return (
                      <View key={`${field}-${item.index}`} testID={`form-row-${rowIndex}-field-${field}`} className="px-1" style={fieldCellStyle}>
                        <Card type="outlined" color="errorContainer">
                          <Text className="text-xs" style={{ color: materialColors.onErrorContainer }}>
                            WARN: inputConfig[{field}].component is undefined
                          </Text>
                        </Card>
                      </View>
                    )
                  }

                  return (
                    <View key={`${field}-${item.index}`} testID={`form-row-${rowIndex}-field-${field}`} className="px-1" style={fieldCellStyle}>
                      <View className="rounded-xl" style={{ opacity: fieldDisabled ? 0.7 : 1 }}>
                        <CustomComponent
                          {...mergedFieldProps}
                          field={field}
                          label={fieldsAlias[field] || field}
                          value={formData[field]}
                          onChangeValue={(nextValue: any) => handleFieldChange(field, nextValue)}
                          onValidationTouch={() => handleFieldTouch(field)}
                          helperMessage={helperMessage}
                          enableHelperMessage={enableHelperMessage}
                          error={fieldErrors[field]}
                          type={type}
                          placeholder={placeholder}
                          prefix={prefix}
                          suffix={suffix}
                          icon={icon}
                          constraint={constraint}
                          renderAction={renderAction}
                          disabled={fieldDisabled}
                          inputProps={inputProps}
                          {...selectInputProps}
                          {...lookupInputProps}
                          {...imageInputProps}
                          {...fileInputProps}
                          {...lookupRuntimeProps}
                        />
                      </View>
                    </View>
                  )
                }

                return (
                  <View key={`${field}-${item.index}`} testID={`form-row-${rowIndex}-field-${field}`} className="px-1" style={fieldCellStyle}>
                    <View className="rounded-xl" style={{ opacity: fieldDisabled ? 0.7 : 1 }}>
                      <MappedComponent
                        field={field}
                        label={fieldsAlias[field] || field}
                        value={formData[field]}
                        onChangeValue={(nextValue: any) => handleFieldChange(field, nextValue)}
                        onValidationTouch={() => handleFieldTouch(field)}
                        helperMessage={helperMessage}
                        enableHelperMessage={enableHelperMessage}
                        error={fieldErrors[field]}
                        type={type}
                        placeholder={placeholder}
                        prefix={prefix}
                        suffix={suffix}
                        icon={icon}
                        constraint={constraint}
                        renderAction={renderAction}
                        disabled={fieldDisabled}
                        inputProps={inputProps}
                        {...selectInputProps}
                        {...lookupInputProps}
                        {...imageInputProps}
                        {...fileInputProps}
                        {...lookupRuntimeProps}
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}

        {statusMessage ? (
          <View className="mt-1 rounded-[10px] px-2.5 py-2" style={{ backgroundColor: statusMessage.type === 'success' ? materialColors.secondaryContainer : materialColors.errorContainer }}>
            <Text className="text-[13px]" style={{ color: statusMessage.type === 'success' ? materialColors.onSecondaryContainer : materialColors.onErrorContainer }}>{statusMessage.text}</Text>
          </View>
        ) : null}

        {!staticMode && !disabled
          ? renderSubmit
            ? renderSubmit({
                loading: loading.get || loading.post,
                submitForm,
                formData,
              })
            : (
                <Pressable className="mt-2 rounded-[10px] items-center justify-center min-h-11" style={{ backgroundColor: materialColors.primary, opacity: loading.post ? 0.7 : 1 }} onPress={submitForm} disabled={loading.post}>
                  <Text className="text-sm font-bold" style={{ color: materialColors.onPrimary }}>{loading.post ? 'Submitting...' : submitLabel}</Text>
                </Pressable>
              )
          : null}
      </View>
    </FormValidationContext.Provider>
  )
}
