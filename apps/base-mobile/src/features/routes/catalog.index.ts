import { compileDiscoveredMobileRouteCatalog } from './catalog.compiler'
import type { MobileCatalogEntry, MobileRouteCatalog } from './catalog.types'

let mobileRouteCatalogCache: MobileRouteCatalog | null = null

export function buildModuleModelKey(moduleSlug: string, modelSlug: string): string {
  return `${moduleSlug}/${modelSlug}`
}

export function buildDetailHref(entry: MobileCatalogEntry, id: string | number): `/${string}` {
  return entry.hrefs.detail.replace(':id', String(id)) as `/${string}`
}

export function buildUpdateHref(entry: MobileCatalogEntry, id: string | number): `/${string}` {
  return entry.hrefs.update.replace(':id', String(id)) as `/${string}`
}

export function getMobileRouteCatalog(): MobileRouteCatalog {
  if (mobileRouteCatalogCache) return mobileRouteCatalogCache
  mobileRouteCatalogCache = compileDiscoveredMobileRouteCatalog()
  return mobileRouteCatalogCache
}

export function clearMobileRouteCatalogCacheForTests() {
  mobileRouteCatalogCache = null
}

export function getCatalogEntry(
  catalog: MobileRouteCatalog,
  moduleSlug: string,
  modelSlug: string
): MobileCatalogEntry | undefined {
  return catalog.byModuleModel.get(buildModuleModelKey(moduleSlug, modelSlug))
}

export function selectCatalogMenuEntries(catalog: MobileRouteCatalog): MobileCatalogEntry[] {
  return catalog.entries
}
