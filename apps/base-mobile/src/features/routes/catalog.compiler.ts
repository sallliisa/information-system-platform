import type {
  MobileCatalogEntry,
  MobileModuleMeta,
  MobileModelConfig,
  MobileRouteCatalog,
} from './catalog.types'
import { getFallbackCatalogSources } from './catalog.fallback'

export const RESERVED_ROUTE_PATHS = new Set<string>(['/login', '/menu', '/profile', '/dashboard', '/dashboard/details'])

export type RuntimeContextModule = {
  keys: () => string[]
  <T = unknown>(id: string): T
}

type RuntimeRequire = {
  context?: (directory: string, useSubdirectories: boolean, regExp: RegExp) => RuntimeContextModule
}

declare const require: RuntimeRequire | undefined

type ParsedModuleSource = {
  moduleSlug: string
}

type ParsedModelSource = {
  moduleSlug: string
  modelSlug: string
}

export type CatalogCompilerSources = {
  modules: { path: string; meta: MobileModuleMeta }[]
  models: { path: string; config: MobileModelConfig }[]
}

type IndexedModuleSource = CatalogCompilerSources['modules'][number] & {
  sourceIndex: number
  parsed: ParsedModuleSource
}

type IndexedModelSource = CatalogCompilerSources['models'][number] & {
  sourceIndex: number
  parsed: ParsedModelSource
}

function parseModuleSourcePath(path: string): ParsedModuleSource {
  const match = path.match(/^\.\/([^/]+)\/([^/]+)\.module\.ts$/)
  if (!match) {
    throw new Error(`Invalid module definition path: ${path}`)
  }

  const [, moduleFolderSlug, moduleFileSlug] = match
  if (moduleFolderSlug !== moduleFileSlug) {
    throw new Error(
      `Module file name mismatch for "${path}". Expected ${moduleFolderSlug}.module.ts inside ${moduleFolderSlug}/ folder.`
    )
  }

  return { moduleSlug: moduleFolderSlug }
}

function parseModelSourcePath(path: string): ParsedModelSource {
  const match = path.match(/^\.\/([^/]+)\/([^/]+)\/([^/]+)\.model\.tsx$/)
  if (!match) {
    throw new Error(`Invalid model definition path: ${path}`)
  }

  const [, moduleSlug, modelFolderSlug, modelFileSlug] = match
  if (modelFolderSlug !== modelFileSlug) {
    throw new Error(
      `Model file name mismatch for "${path}". Expected ${modelFolderSlug}.model.tsx inside ${modelFolderSlug}/ folder.`
    )
  }

  return { moduleSlug, modelSlug: modelFolderSlug }
}

function getRuntimeRequire(): RuntimeRequire | null {
  const runtimeRequire = (globalThis as { require?: RuntimeRequire }).require
  if (runtimeRequire?.context) return runtimeRequire
  if (require?.context) return require
  return null
}

function buildCatalogEntry(
  moduleSlug: string,
  moduleMeta: MobileModuleMeta,
  modelSlug: string,
  config: MobileModelConfig
): MobileCatalogEntry {
  return {
    key: `${moduleSlug}/${modelSlug}`,
    moduleSlug,
    modelSlug,
    module: moduleMeta,
    config,
    permissionKey: config.permission || modelSlug,
    hrefs: {
      list: `/menu/${moduleSlug}/${modelSlug}`,
      create: `/menu/${moduleSlug}/${modelSlug}/create`,
      detail: `/menu/${moduleSlug}/${modelSlug}/detail/:id`,
      update: `/menu/${moduleSlug}/${modelSlug}/update/:id`,
    },
  }
}

function validateReservedCollisions(entry: MobileCatalogEntry) {
  const canonicalRoutes = [entry.hrefs.list, entry.hrefs.create, entry.hrefs.detail, entry.hrefs.update]
  for (const route of canonicalRoutes) {
    if (RESERVED_ROUTE_PATHS.has(route)) {
      throw new Error(`Generated route "${route}" collides with reserved static route path.`)
    }
  }
}

function sortModules(modules: IndexedModuleSource[]): IndexedModuleSource[] {
  return [...modules].sort((left, right) => {
    const leftOrder = left.meta.order ?? Number.MAX_SAFE_INTEGER
    const rightOrder = right.meta.order ?? Number.MAX_SAFE_INTEGER
    if (leftOrder !== rightOrder) return leftOrder - rightOrder
    return left.sourceIndex - right.sourceIndex
  })
}

function resolveModelsForModule(
  moduleSlug: string,
  moduleMeta: MobileModuleMeta,
  moduleModels: IndexedModelSource[]
): IndexedModelSource[] {
  const discovered = [...moduleModels].sort((left, right) => left.sourceIndex - right.sourceIndex)
  const explicitOrder = moduleMeta.models

  if (!explicitOrder || explicitOrder.length === 0) return discovered

  const seen = new Set<string>()
  for (const modelSlug of explicitOrder) {
    if (seen.has(modelSlug)) {
      throw new Error(`Duplicate model slug "${modelSlug}" in ${moduleSlug}.module.ts models ordering.`)
    }
    seen.add(modelSlug)

    const exists = discovered.some((item) => item.parsed.modelSlug === modelSlug)
    if (!exists) {
      throw new Error(`Unknown model slug "${modelSlug}" declared in ${moduleSlug}.module.ts models ordering.`)
    }
  }

  const bySlug = new Map(discovered.map((item) => [item.parsed.modelSlug, item]))
  const ordered = explicitOrder.map((slug) => bySlug.get(slug) as IndexedModelSource)
  const remainder = discovered.filter((item) => !seen.has(item.parsed.modelSlug))
  return [...ordered, ...remainder]
}

export function compileMobileRouteCatalog(sources: CatalogCompilerSources): MobileRouteCatalog {
  const indexedModules: IndexedModuleSource[] = sources.modules.map((item, sourceIndex) => ({
    ...item,
    sourceIndex,
    parsed: parseModuleSourcePath(item.path),
  }))

  const indexedModels: IndexedModelSource[] = sources.models.map((item, sourceIndex) => ({
    ...item,
    sourceIndex,
    parsed: parseModelSourcePath(item.path),
  }))

  const modulesBySlug = new Map<string, IndexedModuleSource>()
  for (const moduleSource of indexedModules) {
    const existing = modulesBySlug.get(moduleSource.parsed.moduleSlug)
    if (existing) {
      throw new Error(`Duplicate module definition for "${moduleSource.parsed.moduleSlug}".`)
    }
    modulesBySlug.set(moduleSource.parsed.moduleSlug, moduleSource)
  }

  const modelListByModule = new Map<string, IndexedModelSource[]>()
  const modelsByKey = new Set<string>()

  for (const modelSource of indexedModels) {
    const { moduleSlug, modelSlug } = modelSource.parsed

    if (modelSource.config.name !== modelSlug) {
      throw new Error(
        `Model name mismatch for ${modelSource.path}. Expected config.name "${modelSlug}", received "${modelSource.config.name}".`
      )
    }

    const key = `${moduleSlug}/${modelSlug}`
    if (modelsByKey.has(key)) {
      throw new Error(`Duplicate model definition for "${key}".`)
    }
    modelsByKey.add(key)

    const current = modelListByModule.get(moduleSlug)
    if (current) current.push(modelSource)
    else modelListByModule.set(moduleSlug, [modelSource])
  }

  for (const [moduleSlug] of modelListByModule) {
    if (!modulesBySlug.has(moduleSlug)) {
      throw new Error(`Missing ${moduleSlug}.module.ts for module folder "${moduleSlug}".`)
    }
  }

  const entries: MobileCatalogEntry[] = []
  const modules: MobileRouteCatalog['modules'] = []
  const byModuleModel = new Map<string, MobileCatalogEntry>()
  const sortedModules = sortModules(Array.from(modulesBySlug.values()))

  for (const moduleSource of sortedModules) {
    const moduleSlug = moduleSource.parsed.moduleSlug
    const moduleMeta = moduleSource.meta
    const discoveredModels = modelListByModule.get(moduleSlug) || []
    const orderedModels = resolveModelsForModule(moduleSlug, moduleMeta, discoveredModels)
    const moduleEntries: MobileCatalogEntry[] = []

    for (const modelSource of orderedModels) {
      const entry = buildCatalogEntry(moduleSlug, moduleMeta, modelSource.parsed.modelSlug, modelSource.config)
      validateReservedCollisions(entry)
      entries.push(entry)
      moduleEntries.push(entry)
      byModuleModel.set(entry.key, entry)
    }

    modules.push({
      moduleSlug,
      module: moduleMeta,
      entries: moduleEntries,
    })
  }

  return {
    entries,
    modules,
    byModuleModel,
  }
}

function normalizeContextPath(path: string): string {
  if (path.startsWith('./')) return path
  return `./${path}`
}

function readDefaultExport<T>(value: unknown): T {
  const moduleValue = value as { default?: unknown }
  if (moduleValue && typeof moduleValue === 'object' && 'default' in moduleValue) {
    return moduleValue.default as T
  }
  return value as T
}

export function compileMobileRouteCatalogFromContexts(
  moduleContext: RuntimeContextModule,
  modelContext: RuntimeContextModule
): MobileRouteCatalog {
  const sources: CatalogCompilerSources = {
    modules: moduleContext.keys().map((path) => ({
      path: normalizeContextPath(path),
      meta: readDefaultExport<MobileModuleMeta>(moduleContext(path)),
    })),
    models: modelContext.keys().map((path) => ({
      path: normalizeContextPath(path),
      config: readDefaultExport<MobileModelConfig>(modelContext(path)),
    })),
  }

  return compileMobileRouteCatalog(sources)
}

export function compileDiscoveredMobileRouteCatalog(): MobileRouteCatalog {
  const runtimeRequire = getRuntimeRequire()
  if (!runtimeRequire?.context) {
    return compileMobileRouteCatalog(getFallbackCatalogSources())
  }

  try {
    const moduleContext = runtimeRequire.context('.', true, /\.module\.ts$/)
    const modelContext = runtimeRequire.context('.', true, /\.model\.tsx$/)
    return compileMobileRouteCatalogFromContexts(moduleContext, modelContext)
  } catch (error: any) {
    const message = String(error?.message || '')
    if (message.includes('require.context')) {
      return compileMobileRouteCatalog(getFallbackCatalogSources())
    }
    throw error
  }
}
