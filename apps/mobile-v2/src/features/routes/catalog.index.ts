import { hasPermissionKey } from '../../lib/route-access'
import { compileDiscoveredMobileRouteCatalog } from './catalog.compiler'
import type { MobileCatalogEntry, MobileRouteCatalog } from './catalog.types'

let mobileRouteCatalogCache: MobileRouteCatalog | null = null

export function buildModuleModelKey(moduleSlug: string, modelSlug: string): string {
  return `${moduleSlug}/${modelSlug}`
}

export function buildDetailHref(entry: MobileCatalogEntry, id: string | number): `/${string}` {
  return `/${entry.moduleSlug}/${entry.modelSlug}/detail/${id}`
}

export function buildUpdateHref(entry: MobileCatalogEntry, id: string | number): `/${string}` {
  return `/${entry.moduleSlug}/${entry.modelSlug}/update/${id}`
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

export function selectCatalogMenuEntries(catalog: MobileRouteCatalog, permissionPayload: unknown): MobileCatalogEntry[] {
  return catalog.entries.filter((entry) => hasPermissionKey(entry.permissionKey, permissionPayload))
}
