import config from '@/config'
import router from '../router'
import { modules } from '@/stores/modules'
import { parseURL } from '@/app/actions/common'
import { storage } from './storage'
import { useColorPreference } from '@/stores/colorpreference'
import { permissions } from '@/stores/permissions'
import mode from '@/mode'
import { toast } from 'vue-sonner'
import { getCurrentHashRouteForRedirect, savePostLoginRedirect } from './post-login-redirect'
import { createAPIClient } from '@repo/sdk'

export type ServiceOptions = {
  bypassErrorToast?: boolean
}

function extractErrorMessage(error: any): string {
  return String(error?.message?.message || error?.message || error?.error || error?.statusText || 'Terjadi kesalahan')
}

function withServiceOptions<T>(promise: Promise<T>, options?: ServiceOptions): Promise<T> {
  return promise.catch((error) => {
    if (!options?.bypassErrorToast) {
      toast.error(extractErrorMessage(error))
    }
    throw error
  })
}

async function notifyLogoutToServer(token: string) {
  try {
    await fetch(`${config.server[mode]}logout`, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${token}`,
      },
      keepalive: true,
    })
  } catch (_) {}
}

function shouldRedirectToSintaOn401(): boolean {
  const profile = storage.localStorage.get('profile') || {}
  return profile?.is_sso === true || String(profile?.login_method || '').toLowerCase() === 'sso'
}

function signOut(notifyServer: boolean = true, options?: { onUnauthorized?: boolean }) {
  const token = storage.cookie.get('token')
  const isSsoUser = shouldRedirectToSintaOn401()

  if (notifyServer && token) {
    void notifyLogoutToServer(token)
  }

  const redirectToSinta = isSsoUser && (Boolean(options?.onUnauthorized) || notifyServer)
  if (redirectToSinta && options?.onUnauthorized) {
    const currentRoute = getCurrentHashRouteForRedirect()
    if (currentRoute) savePostLoginRedirect(currentRoute)
  }

  const colorPreference = useColorPreference().value
  storage.localStorage.clear()
  storage.cookie.clear()
  if (colorPreference) useColorPreference().set(colorPreference)
  modules().clear()
  permissions().clear()

  if (redirectToSinta) {
    window.location.href = 'https://sinta.adhi.co.id'
    return
  }

  router.push({ name: 'login', force: true })
}

export const api = createAPIClient({
  baseURL: config.server[mode],
  defaultHeaders: {
    Accept: 'application/json, text/plain, */*',
  },
  getToken: () => storage.cookie.get('token'),
  onUnauthorized: async () => {
    signOut(false, { onUnauthorized: true })
  },
})

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null

  const filenameStarMatch = header.match(/filename\*\=UTF-8''([^;]+)/)
  if (filenameStarMatch?.[1]) {
    return decodeURIComponent(filenameStarMatch[1])
  }

  const filenameMatch = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (filenameMatch?.[1]) {
    return filenameMatch[1].replace(/['"]/g, '')
  }

  return null
}

const services = {
  signOut,
  exportExcel(model: string, fallbackFilename: string, query?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.raw(`${parseURL(model, '', '/export-excel')}`, query).then(async (response: Response) => {
      const contentDisposition = response.headers.get('Content-Disposition')
      const parsedFilename = parseFilenameFromContentDisposition(contentDisposition)
      const finalFilename = parsedFilename || fallbackFilename

      const blob = await response.blob()
      const link = document.createElement('a')
      link.target = '_parent'
      link.href = window.URL.createObjectURL(blob)
      link.download = finalFilename
      link.click()
      URL.revokeObjectURL(link.href)
    })
    return withServiceOptions(promise, options)
  },
  downloadFile(url: string, filename: string, query?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.raw(url, query).then(async (response: Response) => {
      const contentDisposition = response.headers.get('Content-Disposition')
      const parsedFilename = parseFilenameFromContentDisposition(contentDisposition)
      const finalFilename = parsedFilename || filename

      const blob = await response.blob()
      const link = document.createElement('a')
      link.target = '_parent'
      link.href = window.URL.createObjectURL(blob)
      link.download = finalFilename
      link.click()
      URL.revokeObjectURL(link.href)
    })
    return withServiceOptions(promise, options)
  },
  post(url: string, data: object, options?: ServiceOptions) {
    return withServiceOptions(api.post(url, data), options)
  },
  put(url: string, data: object, options?: ServiceOptions) {
    return withServiceOptions(api.put(url, data), options)
  },
  patch(url: string, data: object, options?: ServiceOptions) {
    return withServiceOptions(api.patch(url, data), options)
  },
  get(url: string, param?: Record<string, any>, options?: ServiceOptions) {
    return withServiceOptions(api.get(url, param), options)
  },
  list(url: string, param?: Record<string, any>, options?: ServiceOptions) {
    return withServiceOptions(api.list(url, param), options)
  },
  raw(url: string, param?: Record<string, any>, options?: ServiceOptions): Promise<Response> {
    return withServiceOptions(api.raw(parseURL(url, '', '/list'), param), options)
  },
  dataset(url: string, param?: Record<string, any>, options?: ServiceOptions) {
    return withServiceOptions(api.dataset(url, param), options)
  },
  detail(url: string, id: number | string | any, param?: Record<string, any>, options?: ServiceOptions) {
    return withServiceOptions(api.detail(url, id, param), options)
  },
  create(url: string, data: object, param?: Record<string, any>, options?: ServiceOptions) {
    return withServiceOptions(api.create(url, data, param), options)
  },
  update(url: string, data: object, param?: Record<string, any>, options?: ServiceOptions) {
    return withServiceOptions(api.update(url, data, param), options)
  },
  delete(url: string, data: object, options?: ServiceOptions) {
    return withServiceOptions(api.remove(parseURL(url, '', '/delete'), data), options)
  },
  progress(method: string, url: string, param: Record<string, any>, _onUploadProgress: Function, options?: ServiceOptions) {
    const normalizedMethod = method.toLowerCase()
    const fn = (api as any)[normalizedMethod]
    if (typeof fn !== 'function') {
      return withServiceOptions(Promise.reject(new Error(`Unsupported method: ${method}`)), options)
    }
    return withServiceOptions(fn(url, param), options)
  },
  async fileUpload(file: File, directory: string = '', onUploadProgress?: (progress: { loaded: number; total: number }) => void, options?: ServiceOptions) {
    try {
      const presignResponse = await withServiceOptions(
        api.post('presigned-url', {
          dir: directory,
          filename: file.name,
          content_type: file.type,
        }),
        options
      )

      const { upload_url, file_path } = presignResponse

      const xhr = new XMLHttpRequest()
      await new Promise((resolve, reject) => {
        xhr.open('PUT', upload_url, true)
        xhr.setRequestHeader('Content-Type', file.type)

        if (onUploadProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              onUploadProgress({
                loaded: event.loaded,
                total: event.total,
              })
            }
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response)
          else reject(new Error(`Upload failed with status ${xhr.status}`))
        }

        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.send(file)
      })

      const register = await withServiceOptions(
        api.post('register-file', {
          path: file_path,
          size: file.size,
        }),
        options
      )

      return {
        success: true,
        path: file_path,
        data: file_path,
        url: register.url,
      }
    } catch (error) {
      console.error(error)
      return { success: false }
    }
  },
  fileUploadNoAuth(file: Blob, _onUploadProgress: Function, options?: ServiceOptions) {
    const formData = new FormData()
    formData.append('file', file)
    return withServiceOptions(api.post('no-auth/upload', formData), options)
  },
}

export default services
