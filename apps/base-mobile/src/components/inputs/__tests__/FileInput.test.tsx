import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Linking } from 'react-native'

jest.mock('expo-document-picker', () => ({
  __esModule: true,
  getDocumentAsync: jest.fn(),
  default: {
    getDocumentAsync: jest.fn(),
  },
}))

jest.mock('../../../lib/api', () => {
  const original = jest.requireActual('../../../lib/api')
  return {
    ...original,
    fileUpload: jest.fn(),
  }
})

jest.mock('../../../lib/toast', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}))

import { FileInput } from '../FileInput'
import { fileUpload } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import * as DocumentPicker from 'expo-document-picker'

describe('FileInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true)
    jest.spyOn(Linking, 'openURL').mockImplementation(async () => undefined)
  })

  function renderFileInput(overrides: Record<string, any> = {}) {
    const onChangeValue = overrides.onChangeValue || jest.fn()
    const onValidationTouch = overrides.onValidationTouch || jest.fn()

    render(
      <FileInput
        field="doc"
        label="Document"
        value={null}
        onChangeValue={onChangeValue}
        onValidationTouch={onValidationTouch}
        {...overrides}
      />
    )

    return { onChangeValue, onValidationTouch }
  }

  it('renders default picker button and max size guidance', () => {
    renderFileInput()
    expect(screen.getByLabelText('doc-pick-file')).toBeTruthy()
    expect(screen.getByText('Ukuran berkas maksimal 10 MB')).toBeTruthy()
  })

  it('renders accepted MIME guidance using pretty names', () => {
    renderFileInput({ accept: ['application/pdf', 'image/jpeg'] })
    expect(screen.getByText('File yang diterima: PDF, JPEG')).toBeTruthy()
  })

  it('existing single value renders filename from filename', () => {
    renderFileInput({ value: { filename: 'sample.pdf' } })
    expect(screen.getByText('sample.pdf')).toBeTruthy()
  })

  it('existing single value falls back to filename from path', () => {
    renderFileInput({ value: { path: 'uploads/docs/path-name.docx' } })
    expect(screen.getByText('path-name.docx')).toBeTruthy()
  })

  it('existing single value falls back to filename from url', () => {
    renderFileInput({ value: { url: 'https://cdn.test/file-url.xlsx' } })
    expect(screen.getByText('file-url.xlsx')).toBeTruthy()
  })

  it('single mode hides picker after one file exists', () => {
    renderFileInput({ value: { filename: 'done.pdf' } })
    expect(screen.queryByLabelText('doc-pick-file')).toBeNull()
  })

  it('picker cancel does not upload, emit, or touch validation', async () => {
    const { onChangeValue, onValidationTouch } = renderFileInput()
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: true, assets: [] })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled())
    expect(fileUpload).not.toHaveBeenCalled()
    expect(onChangeValue).not.toHaveBeenCalled()
    expect(onValidationTouch).not.toHaveBeenCalled()
  })

  it('single upload calls fileUpload and emits uploaded object and touches validation', async () => {
    const { onChangeValue, onValidationTouch } = renderFileInput()
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///a.pdf', name: 'a.pdf', mimeType: 'application/pdf', size: 1200 }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ success: true, path: 'files/a.pdf', url: 'https://cdn/a.pdf' })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(1))
    expect(fileUpload).toHaveBeenCalledWith(
      { uri: 'file:///a.pdf', name: 'a.pdf', type: 'application/pdf', size: 1200 },
      '',
      expect.any(Function)
    )
    expect(onChangeValue).toHaveBeenCalledWith({ success: true, path: 'files/a.pdf', url: 'https://cdn/a.pdf' })
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('multi upload uploads all selected assets sequentially and emits ordered array', async () => {
    const { onChangeValue } = renderFileInput({ multi: true, value: [] })
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///1.pdf', name: '1.pdf', mimeType: 'application/pdf', size: 1000 }, { uri: 'file:///2.pdf', name: '2.pdf', mimeType: 'application/pdf', size: 1000 }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ path: 'p1', url: 'u1' }).mockResolvedValueOnce({ path: 'p2', url: 'u2' })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(2))
    expect((fileUpload as jest.Mock).mock.calls[0][0].name).toBe('1.pdf')
    expect((fileUpload as jest.Mock).mock.calls[1][0].name).toBe('2.pdf')
    expect(onChangeValue).toHaveBeenCalledWith([{ path: 'p1', url: 'u1' }, { path: 'p2', url: 'u2' }])
  })

  it('accept filter rejects unsupported MIME type and does not upload', async () => {
    renderFileInput({ accept: ['application/pdf'] })
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///a.png', name: 'a.png', mimeType: 'image/png', size: 1000 }] })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error).toHaveBeenCalledWith('Tipe berkas tidak didukung. Tipe berkas yang diterima adalah PDF')
    expect(fileUpload).not.toHaveBeenCalled()
  })

  it('accept wildcard such as image/* accepts image/png', async () => {
    const { onChangeValue } = renderFileInput({ accept: ['image/*'] })
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///a.png', name: 'a.png', mimeType: 'image/png', size: 1000 }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ path: 'p', url: 'u' })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(1))
    expect(onChangeValue).toHaveBeenCalledWith({ path: 'p', url: 'u' })
  })

  it('oversized file rejects with max-size toast and does not upload', async () => {
    renderFileInput({ maxSize: 1 })
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///big.pdf', name: 'big.pdf', mimeType: 'application/pdf', size: 1_200_000 }] })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Ukuran berkas terlalu besar. Maksimal 1MB'))
    expect(fileUpload).not.toHaveBeenCalled()
  })

  it('upload progress renders percentage', async () => {
    renderFileInput()
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///progress.pdf', name: 'progress.pdf', mimeType: 'application/pdf', size: 1000 }] })

    let resolveUpload: ((value: any) => void) | undefined
    ;(fileUpload as jest.Mock).mockImplementationOnce((_file: any, _path: string, onUploadProgress: any) => {
      onUploadProgress?.({ loaded: 50, total: 100 })
      return new Promise((resolve) => {
        resolveUpload = resolve
      })
    })

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(screen.getByText('50%')).toBeTruthy())

    resolveUpload?.({ path: 'done', url: 'done-url' })
  })

  it('partial multi-upload failure emits successful files and shows partial failure toast', async () => {
    const { onChangeValue } = renderFileInput({ multi: true, value: [] })
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///ok.pdf', name: 'ok.pdf', mimeType: 'application/pdf', size: 1000 }, { uri: 'file:///bad.pdf', name: 'bad.pdf', mimeType: 'application/pdf', size: 1000 }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ path: 'ok', url: 'ok-url' }).mockRejectedValueOnce(new Error('fail'))

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(onChangeValue).toHaveBeenCalledWith([{ path: 'ok', url: 'ok-url' }]))
    expect(toast.error).toHaveBeenCalledWith('Sebagian berkas gagal diunggah')
  })

  it('full upload failure emits nothing and shows failure toast', async () => {
    const { onChangeValue, onValidationTouch } = renderFileInput()
    ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///bad.pdf', name: 'bad.pdf', mimeType: 'application/pdf', size: 1000 }] })
    ;(fileUpload as jest.Mock).mockRejectedValueOnce(new Error('fail'))

    fireEvent.press(screen.getByLabelText('doc-pick-file'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Gagal mengunggah berkas'))
    expect(onChangeValue).not.toHaveBeenCalled()
    expect(onValidationTouch).not.toHaveBeenCalled()
  })

  it('remove in single mode emits null and touches validation', () => {
    const { onChangeValue, onValidationTouch } = renderFileInput({ value: { filename: 'done.pdf' } })

    fireEvent.press(screen.getByLabelText('doc-remove-0'))

    expect(onChangeValue).toHaveBeenCalledWith(null)
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('remove in multi mode emits remaining array and touches validation', () => {
    const { onChangeValue, onValidationTouch } = renderFileInput({ multi: true, value: [{ filename: 'one.pdf' }, { filename: 'two.pdf' }] })

    fireEvent.press(screen.getByLabelText('doc-remove-0'))

    expect(onChangeValue).toHaveBeenCalledWith([{ filename: 'two.pdf' }])
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('disabled mode hides remove action and disables picker', async () => {
    const { onChangeValue } = renderFileInput({ disabled: true, value: null })

    expect(screen.queryByLabelText('doc-remove-0')).toBeNull()
    expect(screen.getByLabelText('doc-pick-file')).toBeDisabled()

    fireEvent.press(screen.getByLabelText('doc-pick-file'))
    await waitFor(() => expect(DocumentPicker.getDocumentAsync).not.toHaveBeenCalled())
    expect(onChangeValue).not.toHaveBeenCalled()
  })

  it('open URL action calls Linking.openURL', async () => {
    renderFileInput({ value: { filename: 'done.pdf', url: 'https://cdn.test/done.pdf' } })

    fireEvent.press(screen.getByLabelText('doc-open-0'))

    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('https://cdn.test/done.pdf'))
  })

  it('open URL unsupported or thrown error shows cannot-open toast', async () => {
    renderFileInput({ value: { filename: 'done.pdf', url: 'https://cdn.test/done.pdf' } })
    ;(Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false)

    fireEvent.press(screen.getByLabelText('doc-open-0'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Tidak dapat membuka berkas'))

    ;(Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true)
    ;(Linking.openURL as jest.Mock).mockRejectedValueOnce(new Error('bad'))

    fireEvent.press(screen.getByLabelText('doc-open-0'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Tidak dapat membuka berkas'))
  })
})
