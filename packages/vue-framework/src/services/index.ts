export { FrameworkService } from './FrameworkService'
export { parseURL } from './path'
export { parseFilenameFromContentDisposition, downloadBlob } from './download'
export type { FrameworkServiceEndpoints, FrameworkServiceOptions, ServiceRequestOptions } from './types'
export { configureFrameworkService, getFrameworkService, resetFrameworkServiceForTests } from './frameworkServices'
export { default } from './frameworkServices'

import type { FrameworkService } from './FrameworkService'

export type FrameworkServiceLike = FrameworkService & Record<string, any>
