import serviceStub from '@repo/vue-framework/behaviors/common/serviceStub'
import type { FrameworkServiceLike } from '../services'

let boundServices: FrameworkServiceLike = serviceStub as unknown as FrameworkServiceLike

export function configureFrameworkServices(services: FrameworkServiceLike) {
  boundServices = services
}

export function getFrameworkServices() {
  return boundServices
}

const servicesProxy = new Proxy(
  {} as FrameworkServiceLike,
  {
    get(_target, prop) {
      return boundServices[prop as keyof FrameworkServiceLike] ?? serviceStub[prop as keyof typeof serviceStub]
    },
  }
)

export default servicesProxy
