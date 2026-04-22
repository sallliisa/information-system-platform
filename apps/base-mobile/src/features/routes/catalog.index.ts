import { compileDiscoveredMobileRouteCatalog } from './catalog.compiler'
import type { MobileCatalogEntry, MobileRouteCatalog } from './catalog.types'

let mobileRouteCatalogCache: MobileRouteCatalog | null = null

export function buildModuleModelKey(moduleSlug: string, modelSlug: string): string {
  return `${moduleSlug}/${modelSlug}`
}

export function buildCreateHref(entry: MobileCatalogEntry): `/${string}` {
  return `/${entry.moduleSlug}/${entry.modelSlug}/create`
}

export function buildDetailHref(entry: MobileCatalogEntry, id: string | number): `/${string}` {
  return `/${entry.moduleSlug}/${entry.modelSlug}/detail/${id}`
}

export function buildUpdateHref(entry: MobileCatalogEntry, id: string | number): `/${string}` {
  return `/${entry.moduleSlug}/${entry.modelSlug}/update/${id}`
}

export function buildListRoute(entry: MobileCatalogEntry) {
  return {
    pathname: '/(app)/(tabs)/[module]/[model]',
    params: {
      module: entry.moduleSlug,
      model: entry.modelSlug,
    },
  }
}

export function buildCreateRoute(entry: MobileCatalogEntry) {
  return {
    pathname: '/(app)/(tabs)/[module]/[model]/create',
    params: {
      module: entry.moduleSlug,
      model: entry.modelSlug,
    },
  }
}

export function buildDetailRoute(entry: MobileCatalogEntry, id: string | number) {
  return {
    pathname: '/(app)/(tabs)/[module]/[model]/detail/[id]',
    params: {
      module: entry.moduleSlug,
      model: entry.modelSlug,
      id: String(id),
    },
  }
}

export function buildUpdateRoute(entry: MobileCatalogEntry, id: string | number) {
  return {
    pathname: '/(app)/(tabs)/[module]/[model]/update/[id]',
    params: {
      module: entry.moduleSlug,
      model: entry.modelSlug,
      id: String(id),
    },
  }
}

export function getMobileRouteCatalog(): MobileRouteCatalog {
  if (mobileRouteCatalogCache) return mobileRouteCatalogCache
  mobileRouteCatalogCache = compileDiscoveredMobileRouteCatalog()
  return mobileRouteCatalogCache
}

export function clearMobileRouteCatalogCacheForTests() {
  mobileRouteCatalogCache = null
}

export function getCatalogEntry(catalog: MobileRouteCatalog, moduleSlug: string, modelSlug: string): MobileCatalogEntry | undefined {
  return catalog.byModuleModel.get(buildModuleModelKey(moduleSlug, modelSlug))
}

export function selectCatalogMenuEntries(catalog: MobileRouteCatalog): MobileCatalogEntry[] {
  return catalog.entries
}
