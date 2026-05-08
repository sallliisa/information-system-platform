import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import * as ExpoImagePicker from 'expo-image-picker'

jest.mock('expo-image-picker', () => ({
  __esModule: true,
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  default: {
    requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
    requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
  },
}))

jest.mock('expo-image', () => ({
  Image: ({ source, ...props }: any) => {
    const React = require('react')
    const { View } = require('react-native')
    return React.createElement(View, { ...props, testID: `expo-image-${source?.uri || 'none'}` })
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

import { ImageInput } from '../ImageInput'
import { fileUpload } from '../../../lib/api'
import { toast } from '../../../lib/toast'

describe('ImageInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(ExpoImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true })
    ;(ExpoImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true })
  })

  function renderImageInput(overrides: Record<string, any> = {}) {
    const onChangeValue = overrides.onChangeValue || jest.fn()
    const onValidationTouch = overrides.onValidationTouch || jest.fn()

    render(
      <ImageInput
        field="photo"
        label="Photo"
        value={null}
        onChangeValue={onChangeValue}
        onValidationTouch={onValidationTouch}
        {...overrides}
      />
    )

    return { onChangeValue, onValidationTouch }
  }

  it('renders default information text and max size message', () => {
    renderImageInput()
    expect(screen.getByText('Unggah gambar yang akan digunakan')).toBeTruthy()
    expect(screen.getByText('Ukuran berkas maksimal 5 MB')).toBeTruthy()
  })

  it('renders existing single image preview from value.url', () => {
    renderImageInput({ value: { url: 'https://img.test/photo.jpg' } })
    expect(screen.getByTestId('expo-image-https://img.test/photo.jpg')).toBeTruthy()
  })

  it('single mode hides upload actions after one image exists', () => {
    renderImageInput({ value: { url: 'https://img.test/1.jpg' } })
    expect(screen.queryByLabelText('photo-pick-library')).toBeNull()
    expect(screen.queryByLabelText('photo-capture-camera')).toBeNull()
  })

  it('library pick uploads one image, emits uploaded object, and touches validation', async () => {
    const { onChangeValue, onValidationTouch } = renderImageInput()
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///a.jpg', fileName: 'a.jpg', fileSize: 1200, mimeType: 'image/jpeg' }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ success: true, url: 'https://cdn/a.jpg', path: 'files/a.jpg' })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(1))
    expect(onChangeValue).toHaveBeenCalledWith({ success: true, url: 'https://cdn/a.jpg', path: 'files/a.jpg' })
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('camera capture uploads one image, emits uploaded object, and touches validation', async () => {
    const { onChangeValue, onValidationTouch } = renderImageInput()
    ;(ExpoImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///camera.jpg', fileName: 'camera.jpg', fileSize: 1200, mimeType: 'image/jpeg' }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ success: true, url: 'https://cdn/camera.jpg', path: 'files/camera.jpg' })

    fireEvent.press(screen.getByLabelText('photo-capture-camera'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(1))
    expect(onChangeValue).toHaveBeenCalledWith({ success: true, url: 'https://cdn/camera.jpg', path: 'files/camera.jpg' })
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('multi=true library batch uploads selected assets sequentially and emits array preserving selection order', async () => {
    const { onChangeValue } = renderImageInput({ multi: true, value: [] })
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///1.jpg', fileName: '1.jpg', fileSize: 1000, mimeType: 'image/jpeg' }, { uri: 'file:///2.jpg', fileName: '2.jpg', fileSize: 1000, mimeType: 'image/jpeg' }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ path: 'p1', url: 'u1' }).mockResolvedValueOnce({ path: 'p2', url: 'u2' })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(2))
    expect(onChangeValue).toHaveBeenCalledWith([{ path: 'p1', url: 'u1' }, { path: 'p2', url: 'u2' }])
  })

  it('limit caps selected batch and prevents over-capacity uploads', async () => {
    renderImageInput({ multi: true, value: [{ url: 'existing' }], limit: 2 })
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///1.jpg', fileName: '1.jpg', fileSize: 1000, mimeType: 'image/jpeg' }, { uri: 'file:///2.jpg', fileName: '2.jpg', fileSize: 1000, mimeType: 'image/jpeg' }] })
    ;(fileUpload as jest.Mock).mockResolvedValue({ path: 'p1', url: 'u1' })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(fileUpload).toHaveBeenCalledTimes(1))
    expect(toast.info).toHaveBeenCalledWith('Batas maksimal gambar tercapai')
  })

  it('oversized image toasts and does not upload', async () => {
    renderImageInput({ maxSize: 1 })
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///big.jpg', fileName: 'big.jpg', fileSize: 1_100_000, mimeType: 'image/jpeg' }] })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Ukuran berkas terlalu besar'))
    expect(fileUpload).not.toHaveBeenCalled()
  })

  it('remove action emits null in single mode', () => {
    const { onChangeValue, onValidationTouch } = renderImageInput({ value: { url: 'https://img.test/1.jpg' } })
    fireEvent.press(screen.getByLabelText('photo-remove-0'))
    expect(onChangeValue).toHaveBeenCalledWith(null)
    expect(onValidationTouch).toHaveBeenCalled()
  })

  it('remove action emits remaining array in multi mode', () => {
    const { onChangeValue } = renderImageInput({ multi: true, value: [{ url: '1' }, { url: '2' }] })
    fireEvent.press(screen.getByLabelText('photo-remove-0'))
    expect(onChangeValue).toHaveBeenCalledWith([{ url: '2' }])
  })

  it('transform maps upload result keys before emission', async () => {
    const { onChangeValue } = renderImageInput({ transform: { path: 'image' } })
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///a.jpg', fileName: 'a.jpg', fileSize: 1200, mimeType: 'image/jpeg' }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ path: 'files/a.jpg', url: 'u1' })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(onChangeValue).toHaveBeenCalledWith({ image: 'files/a.jpg', url: 'u1' }))
  })

  it('disabled mode prevents picker/camera/remove', () => {
    const { onChangeValue } = renderImageInput({ disabled: true, value: { url: 'x' } })
    expect(screen.queryByLabelText('photo-remove-0')).toBeNull()
    expect(screen.getByTestId('expo-image-x')).toBeTruthy()
    expect(onChangeValue).not.toHaveBeenCalled()
    expect(ExpoImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled()
    expect(ExpoImagePicker.launchCameraAsync).not.toHaveBeenCalled()
  })

  it('partial batch failure keeps successful uploads and reports failure', async () => {
    const { onChangeValue } = renderImageInput({ multi: true, value: [] })
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///ok.jpg', fileName: 'ok.jpg', fileSize: 1000, mimeType: 'image/jpeg' }, { uri: 'file:///bad.jpg', fileName: 'bad.jpg', fileSize: 1000, mimeType: 'image/jpeg' }] })
    ;(fileUpload as jest.Mock).mockResolvedValueOnce({ path: 'ok', url: 'ok-url' }).mockRejectedValueOnce(new Error('fail'))

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(onChangeValue).toHaveBeenCalledWith([{ path: 'ok', url: 'ok-url' }]))
    expect(toast.error).toHaveBeenCalledWith('Sebagian gambar gagal diunggah')
  })

  it('picker cancel does not emit and does not touch validation', async () => {
    const { onChangeValue, onValidationTouch } = renderImageInput()
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: true, assets: [] })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(ExpoImagePicker.launchImageLibraryAsync).toHaveBeenCalled())
    expect(onChangeValue).not.toHaveBeenCalled()
    expect(onValidationTouch).not.toHaveBeenCalled()
  })

  it('uploading state renders per-image progress', async () => {
    renderImageInput()
    ;(ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///progress.jpg', fileName: 'progress.jpg', fileSize: 1000, mimeType: 'image/jpeg' }] })

    let resolveUpload: ((value: any) => void) | undefined
    ;(fileUpload as jest.Mock).mockImplementationOnce((_file: any, _path: string, onUploadProgress: any) => {
      onUploadProgress?.({ loaded: 50, total: 100 })
      return new Promise((resolve) => {
        resolveUpload = resolve
      })
    })

    fireEvent.press(screen.getByLabelText('photo-pick-library'))

    await waitFor(() => expect(screen.getByText('50%')).toBeTruthy())

    resolveUpload?.({ path: 'done', url: 'done-url' })
  })
})
