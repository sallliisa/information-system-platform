import { useMemo, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { BaseInput } from './BaseInput'
import type { FileUploadResult, FormInputComponentProps } from './types'
import { Button, Icon } from '../base'
import { materialColors } from '../../theme/material'
import { fileUpload, type MobileUploadFile } from '../../lib/api'
import { toast } from '../../lib/toast'

type UploadingFile = {
  name: string
  progress: number
}

type UploadingState = Record<string, UploadingFile>

const BYTES_PER_MB = 1024 * 1024

const MIME_TYPE_NAMES: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/x-msvideo': 'AVI',
  'video/quicktime': 'MOV',
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'text/plain': 'TXT',
  'audio/mpeg': 'MP3',
  'audio/wav': 'WAV',
  'audio/ogg': 'OGG',
  'audio/aac': 'AAC',
}

function normalizeFiles(value: unknown): FileUploadResult[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object') as FileUploadResult[]
  if (typeof value === 'object') return [value as FileUploadResult]
  return []
}

function getFileName(item: FileUploadResult): string {
  if (typeof item.filename === 'string' && item.filename) return item.filename

  const fromPath = typeof item.path === 'string' ? item.path.split('?')[0]?.split('/').filter(Boolean).pop() : ''
  if (fromPath) return fromPath

  const fromURL = typeof item.url === 'string' ? item.url.split('?')[0]?.split('/').filter(Boolean).pop() : ''
  if (fromURL) return fromURL

  return 'file'
}

function getFileExtension(filenameOrUrl: string): string {
  const candidate = filenameOrUrl.split('?')[0] || ''
  const ext = candidate.includes('.') ? candidate.split('.').pop() : ''
  return (ext || '').toUpperCase()
}

function formatAcceptedTypes(acceptTypes: string[]): string[] {
  return acceptTypes.map((type) => MIME_TYPE_NAMES[type] || type)
}

type DocumentPickerAsset = DocumentPicker.DocumentPickerAsset

function getAssetMimeType(asset: DocumentPickerAsset): string {
  return asset.mimeType || 'application/octet-stream'
}

function isAcceptedMimeType(mimeType: string, accepted: string[]): boolean {
  if (!accepted.length) return true

  return accepted.some((rule) => {
    if (rule === mimeType) return true
    if (!rule.endsWith('/*')) return false
    const prefix = rule.slice(0, -1)
    return mimeType.startsWith(prefix)
  })
}

function getAssetName(asset: DocumentPickerAsset): string {
  if (asset.name) return asset.name
  const fromUri = asset.uri.split('?')[0]?.split('/').filter(Boolean).pop()
  return fromUri || `file-${Date.now()}`
}

async function openFileUrl(url?: string) {
  if (!url) return

  try {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
      return
    }
  } catch {
    // noop, handled below
  }

  toast.error('Tidak dapat membuka berkas')
}

function getDocumentAsyncSafe() {
  const module = DocumentPicker as unknown as {
    getDocumentAsync?: typeof DocumentPicker.getDocumentAsync
    default?: { getDocumentAsync?: typeof DocumentPicker.getDocumentAsync }
  }
  return module.getDocumentAsync || module.default?.getDocumentAsync
}

export function FileInput({
  field,
  label,
  value,
  onChangeValue,
  onValidationTouch,
  helperMessage,
  enableHelperMessage,
  error,
  disabled = false,
  accept,
  maxSize = 10,
  multi = false,
  uploadPath = '',
}: FormInputComponentProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingState>({})

  const files = useMemo(() => normalizeFiles(value), [value])
  const acceptTypes = useMemo(() => (Array.isArray(accept) ? accept.filter((item) => typeof item === 'string') : []), [accept])
  const prettyAcceptedTypes = useMemo(() => formatAcceptedTypes(acceptTypes), [acceptTypes])
  const isUploading = Object.keys(uploadingFiles).length > 0

  async function processAssets(assets: DocumentPickerAsset[], handleValidationTouch: () => void) {
    const validAssets = assets.filter((item) => item && item.uri)
    if (!validAssets.length) return

    const selectedAssets = multi ? validAssets : (files.length > 0 ? [] : validAssets.slice(0, 1))
    if (!selectedAssets.length) return

    const successful: FileUploadResult[] = []
    let failedCount = 0

    for (const asset of selectedAssets) {
      const mimeType = getAssetMimeType(asset)
      const assetName = getAssetName(asset)

      if (acceptTypes.length > 0 && !isAcceptedMimeType(mimeType, acceptTypes)) {
        failedCount += 1
        toast.error(`Tipe berkas tidak didukung. Tipe berkas yang diterima adalah ${prettyAcceptedTypes.join(', ')}`)
        continue
      }

      if (typeof asset.size === 'number' && asset.size > maxSize * BYTES_PER_MB) {
        failedCount += 1
        toast.error(`Ukuran berkas terlalu besar. Maksimal ${maxSize}MB`)
        continue
      }

      const uploadKey = `${asset.uri}-${assetName}-${Date.now()}-${Math.random().toString(36).slice(2)}`

      setUploadingFiles((prev) => ({
        ...prev,
        [uploadKey]: {
          name: assetName,
          progress: 0,
        },
      }))

      try {
        const file: MobileUploadFile = {
          uri: asset.uri,
          name: assetName,
          type: mimeType,
          size: asset.size,
        }

        const uploadResult = await fileUpload(file, uploadPath, (progress) => {
          const percentage = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0
          setUploadingFiles((prev) => {
            const current = prev[uploadKey]
            if (!current) return prev
            return {
              ...prev,
              [uploadKey]: {
                ...current,
                progress: percentage,
              },
            }
          })
        })

        successful.push(uploadResult)
      } catch {
        failedCount += 1
      } finally {
        setUploadingFiles((prev) => {
          if (!prev[uploadKey]) return prev
          const next = { ...prev }
          delete next[uploadKey]
          return next
        })
      }
    }

    if (successful.length > 0) {
      if (multi) {
        onChangeValue([...files, ...successful])
      } else {
        onChangeValue(successful[0] || null)
      }
      handleValidationTouch()
    }

    if (failedCount > 0 && successful.length > 0) {
      toast.error('Sebagian berkas gagal diunggah')
    } else if (failedCount > 0) {
      toast.error('Gagal mengunggah berkas')
    }
  }

  async function pickFiles(handleValidationTouch: () => void) {
    if (disabled) return
    if (!multi && files.length > 0) return

    const pickerFn = getDocumentAsyncSafe()
    if (!pickerFn) return

    const result = await pickerFn({
      type: acceptTypes.length > 0 ? acceptTypes : '*/*',
      multiple: multi,
      copyToCacheDirectory: true,
    })

    if (result.canceled) return
    await processAssets(result.assets || [], handleValidationTouch)
  }

  function removeFile(index: number, handleValidationTouch: () => void) {
    if (disabled) return

    if (!multi) {
      onChangeValue(null)
      handleValidationTouch()
      return
    }

    onChangeValue(files.filter((_, fileIndex) => fileIndex !== index))
    handleValidationTouch()
  }

  return (
    <BaseInput
      field={field}
      label={label}
      error={error}
      helperMessage={helperMessage}
      enableHelperMessage={enableHelperMessage}
      onValidationTouch={onValidationTouch}
    >
      {({ onValidationTouch: handleValidationTouch }) => (
        <View className="gap-2" style={{ opacity: disabled ? 0.65 : 1 }}>
          {(multi || files.length === 0) && !isUploading ? (
            <Button
              accessibilityLabel={`${field}-pick-file`}
              variant="tonal"
              className="self-start"
              onPress={() => {
                void pickFiles(handleValidationTouch)
              }}
              disabled={disabled}
            >
              <Icon name="upload" />
              <Text>Pilih berkas</Text>
            </Button>
          ) : null}

          {Object.entries(uploadingFiles).map(([key, item]) => (
            <View key={`uploading-${key}`} className="gap-1 rounded-lg p-2" style={{ backgroundColor: materialColors.surfaceContainerHighest }}>
              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 text-sm" numberOfLines={1} style={{ color: materialColors.onSurface }}>{item.name}</Text>
                {item.progress > 0 ? (
                  <Text className="text-xs font-semibold" style={{ color: materialColors.primary }}>{item.progress}%</Text>
                ) : (
                  <ActivityIndicator size="small" color={materialColors.primary} />
                )}
              </View>
              <View className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: materialColors.outlineVariant }}>
                <View style={{ width: `${Math.max(0, Math.min(100, item.progress))}%`, height: '100%', backgroundColor: materialColors.primary }} />
              </View>
            </View>
          ))}

          <View className="gap-2">
            {files.map((item, index) => {
              const name = getFileName(item)
              const extension = getFileExtension(name || item.url || '')

              return (
                <View
                  key={`uploaded-${index}-${name}-${item.url || item.path || ''}`}
                  className="flex-row items-center gap-2 rounded-lg p-2"
                  style={{ borderWidth: 1, borderColor: materialColors.outlineVariant, backgroundColor: materialColors.surfaceContainerHighest }}
                >
                  <Icon name="file" color={materialColors.onSurfaceVariant} />
                  <View className="flex-1">
                    <Text className="text-sm" numberOfLines={1} style={{ color: materialColors.onSurface }}>{name}</Text>
                    {extension ? (
                      <Text className="text-xs" style={{ color: materialColors.onSurfaceVariant }}>{extension}</Text>
                    ) : null}
                  </View>

                  {item.url ? (
                    <Button
                      accessibilityLabel={`${field}-open-${index}`}
                      variant="outlined"
                      onPress={() => {
                        void openFileUrl(item.url)
                      }}
                    >
                      <Text>Buka</Text>
                    </Button>
                  ) : null}

                  {!disabled ? (
                    <Pressable
                      accessibilityLabel={`${field}-remove-${index}`}
                      onPress={() => removeFile(index, handleValidationTouch)}
                      className="rounded-full p-1"
                      style={{ backgroundColor: materialColors.errorContainer }}
                    >
                      <Icon name="close" size={14} color={materialColors.onErrorContainer} />
                    </Pressable>
                  ) : null}
                </View>
              )
            })}
          </View>

          {(acceptTypes.length > 0 || Boolean(maxSize)) ? (
            <View className="gap-1">
              {acceptTypes.length > 0 ? (
                <Text className="text-xs" style={{ color: materialColors.onSurfaceVariant }}>
                  {`File yang diterima: ${prettyAcceptedTypes.join(', ')}`}
                </Text>
              ) : null}
              <Text className="text-xs" style={{ color: materialColors.onSurfaceVariant }}>
                {`Ukuran berkas maksimal ${maxSize} MB`}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </BaseInput>
  )
}

export type { FormInputComponentProps as FormFileInputProps }
