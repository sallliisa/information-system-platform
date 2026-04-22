import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { InputConfig } from '@repo/model-meta'
import { Card } from '../base'
import { materialColors } from '../../theme/material'
import { mobileTextInputContentStyle } from '../../theme/textInput'

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

  useEffect(() => {
    let mounted = true

    async function loadInitialData() {
      setLoading(true)
      try {
        const initial = (await getInitialData?.()) || {}
        const seeded = {
          ...initial,
          ...(formType === 'update' && dataID ? { id: dataID } : null),
        }
        if (!mounted) return
        setFormData(seeded)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadInitialData()
    return () => {
      mounted = false
    }
  }, [dataID, formType, getInitialData])

  const setFieldValue = useCallback((field: string, value: any) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }, [])

  const submit = useCallback(async () => {
    setSubmitting(true)
    try {
      const payload = { ...formData, ...extraData }
      const response = {
        stub: true,
        targetAPI,
        getAPI,
        searchParameters,
        mode: formType,
      }
      onSuccess?.({ formData: payload, res: response })
    } finally {
      setSubmitting(false)
    }
  }, [extraData, formData, formType, getAPI, onSuccess, searchParameters, targetAPI])

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Card>
      <View style={styles.container}>
        <Text style={styles.stubNote}>Form stub active in mobile-v2 phase</Text>

        {fields.map((field) => {
          if (field.startsWith('S|') || field.startsWith('S1|')) {
            return (
              <Text key={field} style={styles.sectionTitle}>
                {field.replace(/^S1?\|/, '')}
              </Text>
            )
          }

          const config = inputConfig[field]
          const label = fieldsAlias[field] || field
          const currentValue = formData[field]
          const disabled = Boolean(config?.props?.disabled)
          const isMultiline = config?.type === 'textarea'

          return (
            <View key={field} style={styles.fieldWrap}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                editable={!disabled}
                value={currentValue === undefined || currentValue === null ? '' : String(currentValue)}
                onChangeText={(value) => setFieldValue(field, value)}
                placeholder={label}
                multiline={isMultiline}
                secureTextEntry={config?.type === 'password'}
                style={[
                  mobileTextInputContentStyle,
                  styles.input,
                  isMultiline ? styles.multilineInput : null,
                  disabled ? styles.inputDisabled : null,
                ]}
                placeholderTextColor={materialColors.onSurfaceVariant}
              />
            </View>
          )
        })}

        <Pressable style={[styles.submitButton, submitting ? styles.submitButtonDisabled : null]} disabled={submitting} onPress={submit}>
          <Text style={styles.submitButtonLabel}>{submitting ? 'Submitting...' : 'Submit (Stub)'}</Text>
        </Pressable>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  container: {
    gap: 12,
  },
  stubNote: {
    fontSize: 12,
    color: materialColors.onSurfaceVariant,
  },
  sectionTitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: materialColors.primary,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: materialColors.onSurface,
  },
  input: {
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    borderRadius: 12,
    backgroundColor: materialColors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: materialColors.onSurface,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  submitButton: {
    marginTop: 2,
    backgroundColor: materialColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitButtonLabel: {
    color: materialColors.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
})
