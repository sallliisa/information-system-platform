import { FrameworkService } from './FrameworkService'
import type { FrameworkServiceLike, FrameworkServiceOptions } from './index'

const makeMethod = (name: string) => async (..._args: any[]): Promise<any> => {
  throw new Error(`[vue-framework] ${name} is not configured. Call configureFrameworkService(...) during app bootstrap.`)
}

const unconfiguredService = {
  list: makeMethod('services.list'),
  dataset: makeMethod('services.dataset'),
  detail: makeMethod('services.detail'),
  get: makeMethod('services.get'),
  post: makeMethod('services.post'),
  put: makeMethod('services.put'),
  patch: makeMethod('services.patch'),
  delete: makeMethod('services.delete'),
  create: makeMethod('services.create'),
  update: makeMethod('services.update'),
  remove: makeMethod('services.remove'),
  raw: makeMethod('services.raw'),
  downloadFile: makeMethod('services.downloadFile'),
  upload: makeMethod('services.upload'),
  fileUpload: makeMethod('services.fileUpload'),
  fileUploadNoAuth: makeMethod('services.fileUploadNoAuth'),
} as unknown as FrameworkServiceLike

let currentService: FrameworkServiceLike = unconfiguredService

function isFrameworkServiceLike(value: FrameworkServiceOptions | FrameworkServiceLike): value is FrameworkServiceLike {
  return typeof (value as FrameworkServiceLike)?.get === 'function' && typeof (value as FrameworkServiceLike)?.post === 'function'
}

export function configureFrameworkService(value: FrameworkServiceOptions | FrameworkServiceLike): FrameworkServiceLike {
  currentService = isFrameworkServiceLike(value) ? value : (new FrameworkService(value) as FrameworkServiceLike)
  return currentService
}

export function getFrameworkService(): FrameworkServiceLike {
  return currentService
}

export function resetFrameworkServiceForTests() {
  currentService = unconfiguredService
}

const frameworkServices = new Proxy({} as FrameworkServiceLike, {
  get(_target, prop) {
    return currentService[prop as keyof FrameworkServiceLike]
  },
})

export default frameworkServices
