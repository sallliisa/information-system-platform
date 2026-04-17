import config from '@/config'
import router from '../router'
import { modules } from '@/stores/modules'
// import { toast } from '@/stores/_toast'
import { parseURL } from '@/app/actions/common'
import _app from '@/app/configs/_app'
import { storage } from './storage'
import { useColorPreference } from '@/stores/colorpreference'
import { permissions } from '@/stores/permissions'
import { Apostle } from './apostle'
import mode from '@/mode'
import { toast } from 'vue-sonner'
import { getCurrentHashRouteForRedirect, savePostLoginRedirect } from './post-login-redirect'

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

export const api = new Apostle({
  baseURL: config.server[mode],
  init: {
    headers: {
      Accept: 'application/json, text/plain, */*',
    },
  },
  effect: {
    onSuccess: async () => {},
    onError: async (error) => {
      if ((error as any).status === 401) signOut(false, { onUnauthorized: true })
      if ((error as any).clone) throw await (error as any).clone().json()
      else throw error
    },
  },
  transformer: {
    request: (body) => {
      return body
    },
    response: (body) => body,
  },
  interceptor: (init) => {
    const token = storage.cookie.get('token')
    if (token && init.headers) (init.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    return init
  },
  config: {
    // defaultResponseType: 'json',
    inferRequestBodyContentType: true,
    inferResponseBodyContentType: true,
    parseObjectAsJSON: true,
  },
})

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

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null

  // Try to match UTF-8 filename first (RFC 5987)
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
    const promise = (api.dispatch({ method: 'GET', url: `${config.server[mode]}${model}/export-excel`, query, responseType: 'raw' }) as Promise<Response>).then(async (response: Response) => {
      const contentDisposition = response.headers.get('Content-Disposition')
      let finalFilename = fallbackFilename

      const parsedFilename = parseFilenameFromContentDisposition(contentDisposition)
      if (parsedFilename) {
        finalFilename = parsedFilename
      }

      const blob = await response.blob()
      const link = document.createElement('a')
      link.target = '_parent'
      link.href = window.URL.createObjectURL(blob)
      link.download = finalFilename
      link.click()
      // document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })
    return withServiceOptions(promise, options)
  },
  downloadFile(url: string, filename: string, query?: Record<string, any>, options?: ServiceOptions) {
    const promise = (api.dispatch({ method: 'GET', url: `${config.server[mode]}${url}`, query, responseType: 'raw' }) as Promise<Response>).then(async (response: Response) => {
      const contentDisposition = response.headers.get('Content-Disposition')
      let finalFilename = filename
      const parsedFilename = parseFilenameFromContentDisposition(contentDisposition)
      if (parsedFilename) {
        finalFilename = parsedFilename
      }

      const blob = await response.blob()
      const link = document.createElement('a')
      link.target = '_parent'
      link.href = window.URL.createObjectURL(blob)
      link.download = finalFilename
      link.click()
      // document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })
    return withServiceOptions(promise, options)
  },
  post(url: string, data: Object, options?: ServiceOptions) {
    const promise = api.post(`${url}`, data)
    return withServiceOptions(promise, options)
  },
  put(url: string, data: Object, options?: ServiceOptions) {
    const promise = api.put(`${url}`, data)
    return withServiceOptions(promise, options)
  },
  patch(url: string, data: Object, options?: ServiceOptions) {
    const promise = api.patch(`${url}`, data)
    return withServiceOptions(promise, options)
  },
  get(url: string, param?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.get({ path: url, query: param })
    return withServiceOptions(promise, options)
  },
  list(url: string, param?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.get({ path: parseURL(url, '', '/list'), query: param })
    return withServiceOptions(promise, options)
  },
  raw(url: string, param?: Record<string, any>, options?: ServiceOptions): Promise<Response> {
    const promise = api.dispatch({ method: 'GET', url: `${config.server[mode]}${parseURL(url, '', '/list')}`, query: param, responseType: 'raw' }) as Promise<Response>
    return withServiceOptions(promise, options)
  },
  dataset(url: string, param?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.get({ path: parseURL(url, '', '/dataset'), query: param })
    return withServiceOptions(promise, options)
  },
  detail(url: string, id: number | string | any, param?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.get({ path: parseURL(url, '', `${id ? `/${id}` : ''}/show`), query: param })
    return withServiceOptions(promise, options)
  },
  create(url: string, data: Object, param?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.post({ path: parseURL(url, '', '/create'), query: param }, data)
    return withServiceOptions(promise, options)
  },
  update(url: string, data: Object, param?: Record<string, any>, options?: ServiceOptions) {
    const promise = api.put({ path: parseURL(url, '', '/update'), query: param }, data)
    return withServiceOptions(promise, options)
  },
  delete(url: string, data: Object, options?: ServiceOptions) {
    const promise = api.delete(parseURL(url, '', '/delete'), data)
    return withServiceOptions(promise, options)
  },
  progress(method: string, url: string, param: Record<string, any>, onUploadProgress: Function, options?: ServiceOptions) {
    const promise = (api as any)[method](url, param, {
      onUploadProgress,
    })
    return withServiceOptions(promise, options)
  },
  // fileUpload(file: Blob, onUploadProgress: Function) {
  //   const formData = new FormData()
  //   formData.append('file', file)
  //   const promise = api.post('upload', formData)
  //   promiseHandler().introduce(promise)
  //   return promise
  // },
  async fileUpload(file: File, directory: string = '', onUploadProgress?: (progress: { loaded: number; total: number }) => void, options?: ServiceOptions) {
    try {
      // 1. Minta Laravel generate presigned URL
      const presignResponse = await withServiceOptions(
        api.post('presigned-url', {
          dir: directory,
          filename: file.name,
          content_type: file.type,
        }),
        options,
      )

      const { upload_url, file_path } = presignResponse

      // fetch(upload_url, {
      //     method: 'PUT',
      //     body: file
      // });
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
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Upload failed'))
        }

        xhr.send(file)
      })

      // 3. Informasikan ke backend
      const register = await withServiceOptions(
        api.post('register-file', {
          path: file_path,
          size: file.size,
        }),
        options,
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
  fileUploadNoAuth(file: Blob, onUploadProgress: Function, options?: ServiceOptions) {
    const formData = new FormData()
    formData.append('file', file)
    const promise = api.post('no-auth/upload', formData)
    return withServiceOptions(promise, options)
  },
}

export default services
