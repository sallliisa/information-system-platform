import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { evaluateFieldDependencies, type InputConfig } from '@repo/model-meta'
import { api } from '../../lib/api'

type FormProps = {
  fields: string[]
  inputConfig?: InputConfig
  fieldsAlias?: Record<string, string>
  targetAPI?: string
  getAPI?: string
  dataID?: string
  searchParameters?: Record<string, any>
  formType?: 'create' | 'update'
  extraData?: Record<string, any>
  getInitialData?: () => Promise<Record<string, any>>
  onSuccess?: (params: { formData: Record<string, any>; res: Record<string, any> }) => void
}

type Option = {
  id: string | number | boolean
  name: string
}

function isFieldRequired(fieldName: string, inputConfig: InputConfig, visibility: Record<string, boolean>) {
  const config = inputConfig[fieldName]
  if (!config || visibility[fieldName] === false) return false
  const rules = config.props?.validation as string[] | undefined
  return Boolean(rules?.includes('required'))
}

function normalizeOptions(payload: any[]): Option[] {
  return payload.map((item) => ({
    id: item?.id ?? item?.value ?? item?.code,
    name: item?.name ?? item?.title ?? item?.label ?? item?.code ?? String(item?.id ?? item?.value ?? '-'),
  }))
}

export function Form({
  fields,
  inputConfig = {},
  fieldsAlias = {},
  targetAPI,
  getAPI,
  dataID,
  searchParameters,
  formType = 'create',
  extraData = {},
  getInitialData,
  onSuccess,
}: FormProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [remoteOptions, setRemoteOptions] = useState<Record<string, Option[]>>({})

  const dependencies = useMemo(() => evaluateFieldDependencies(formData, inputConfig), [formData, inputConfig])
  const visibility = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(inputConfig).map(([field]) => [field, dependencies[field]?.visibility?.value ?? true])
      ) as Record<string, boolean>,
    [dependencies, inputConfig]
  )

  useEffect(() => {
    let mounted = true
    async function loadInitialData() {
      setLoading(true)
      try {
        const initial = (await getInitialData?.()) || {}
        let detail = {}

        if (formType === 'update' && dataID) {
          const response = await api.detail(getAPI || targetAPI || '', dataID, searchParameters)
          detail = response?.data ?? response ?? {}
        }

        if (!mounted) return
        const merged = { ...initial, ...detail }
        for (const [field, config] of Object.entries(inputConfig)) {
          if (merged[field] === undefined && config.props?.defaultValue !== undefined) {
            merged[field] = config.props.defaultValue
          }
        }
        setFormData(merged)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    async function loadOptions() {
      const next: Record<string, Option[]> = {}
      for (const field of fields) {
        const fieldConfig = inputConfig[field]
        if (!fieldConfig) continue
        const type = fieldConfig.type
        const endpoint = fieldConfig.props?.getAPI
        if ((type === 'select' || type === 'lookup') && endpoint) {
          try {
            const response = await api.dataset(endpoint, { active: true, limit: 99999 })
            const rows = response?.data ?? []
            next[field] = normalizeOptions(rows)
          } catch {
            next[field] = []
          }
        }
      }
      if (mounted) setRemoteOptions(next)
    }

    void Promise.all([loadInitialData(), loadOptions()])
    return () => {
      mounted = false
    }
  }, [dataID, fields, formType, getAPI, getInitialData, inputConfig, searchParameters, targetAPI])

  const setFieldValue = useCallback((field: string, value: any) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {}
    for (const field of fields) {
      if (!isFieldRequired(field, inputConfig, visibility)) continue
      const value = formData[field]
      if (value === undefined || value === null || value === '') {
        nextErrors[field] = `${fieldsAlias[field] || field} wajib diisi`
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [fields, fieldsAlias, formData, inputConfig, visibility])

  const submit = useCallback(async () => {
    if (!targetAPI) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = { ...formData, ...extraData }
      const response = formType === 'update' ? await api.update(targetAPI, payload) : await api.create(targetAPI, payload)
      onSuccess?.({ formData: payload, res: response })
    } finally {
      setSubmitting(false)
    }
  }, [extraData, formData, formType, onSuccess, targetAPI, validate])

  if (loading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View className="rounded-xl border border-border bg-white p-4">
      <View className="gap-4">
        {fields.map((field) => {
          if (field.startsWith('S|') || field.startsWith('S1|')) {
            return (
              <Text key={field} className="mt-2 text-sm font-semibold text-primary">
                {field.replace(/^S1?\|/, '')}
              </Text>
            )
          }

          const config = inputConfig[field]
          if (!config || visibility[field] === false) return null

          const label = fieldsAlias[field] || field
          const dependencyProps = dependencies[field]?.props?.value || {}
          const currentValue = formData[field]
          const options = (remoteOptions[field] || config.props?.data || []) as Option[]
          const disabled = dependencies[field]?.disabled?.value || config.props?.disabled

          return (
            <View key={field} className="gap-1">
              <Text className="text-sm font-medium text-text">{label}</Text>

              {config.type === 'select' || config.type === 'lookup' || config.type === 'radio' ? (
                <View className="rounded-xl border border-border bg-slate-50">
                  <Picker
                    enabled={!disabled}
                    selectedValue={currentValue}
                    onValueChange={(value) => setFieldValue(field, value)}
                  >
                    <Picker.Item label={`Pilih ${label}`} value={undefined} />
                    {options.map((option) => (
                      <Picker.Item key={String(option.id)} label={option.name} value={option.id} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <TextInput
                  editable={!disabled}
                  className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-text"
                  placeholder={label}
                  multiline={config.type === 'textarea'}
                  secureTextEntry={config.type === 'password'}
                  value={currentValue === undefined || currentValue === null ? '' : String(currentValue)}
                  onChangeText={(value) => setFieldValue(field, value)}
                  {...dependencyProps}
                />
              )}

              {errors[field] ? <Text className="text-xs text-red-600">{errors[field]}</Text> : null}
            </View>
          )
        })}

        <Pressable
          className={`mt-2 items-center rounded-xl px-4 py-3 ${submitting ? 'bg-slate-400' : 'bg-primary'}`}
          disabled={submitting}
          onPress={submit}
        >
          <Text className="font-semibold text-white">{submitting ? 'Menyimpan...' : 'Submit'}</Text>
        </Pressable>
      </View>
    </View>
  )
}
