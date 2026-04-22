import type { ReactNode } from 'react'
import type {
  CreateConfig,
  DetailConfig,
  ListConfig,
  ModelConfig,
  TransactionConfig,
  UpdateConfig,
  ViewConfig,
} from '@repo/model-meta'

export type MobileModelConfig = Omit<ModelConfig, 'view' | 'transaction'> & {
  icon?: string
  description?: string
  order?: number
  view?: MobileViewConfig
  transaction?: MobileTransactionConfig
}

export type MobileDetailConfig = DetailConfig & {
  slots?: {
    detailUnder?: (props: { data: Record<string, any>; config: MobileModelConfig }) => ReactNode
  }
}

export type MobileViewConfig = Omit<ViewConfig, 'detail' | 'list'> & {
  detail?: MobileDetailConfig
  list?: ListConfig & {
    slots?: {}
  }
}

export type MobileTransactionConfig = Omit<TransactionConfig, 'create' | 'update'> & {
  create?: CreateConfig & {
    slots?: {}
  }
  update?: UpdateConfig & {
    slots?: {}
  }
}

export type MobileModuleMeta = {
  name: string
  icon?: string
  description?: string
  order?: number
  models?: string[]
}

export type MobileCatalogEntry = {
  key: string
  moduleSlug: string
  modelSlug: string
  module: MobileModuleMeta
  config: MobileModelConfig
  permissionKey: string
  hrefs: {
    list: `/${string}`
    create: `/${string}`
    detail: `/${string}`
    update: `/${string}`
  }
}

export type MobileCatalogModuleGroup = {
  moduleSlug: string
  module: MobileModuleMeta
  entries: MobileCatalogEntry[]
}

export type MobileRouteCatalog = {
  entries: MobileCatalogEntry[]
  modules: MobileCatalogModuleGroup[]
  byModuleModel: Map<string, MobileCatalogEntry>
}
