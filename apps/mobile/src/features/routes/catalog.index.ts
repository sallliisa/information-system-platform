import { hasPermissionKey } from '../../lib/route-access'
import { compileDiscoveredMobileRouteCatalog } from './catalog.compiler'
import type { MobileCatalogEntry, MobileRouteCatalog } from './catalog.types'

const DEFAULT_PRIVATE_ROUTE_FALLBACK = '/menu'
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

export function selectDefaultPrivateRouteHref(
  catalog: MobileRouteCatalog,
  permissionPayload: unknown,
  fallback: string = DEFAULT_PRIVATE_ROUTE_FALLBACK
): string {
  const firstAccessibleEntry = selectCatalogMenuEntries(catalog, permissionPayload)[0]
  return firstAccessibleEntry?.hrefs.list || fallback
}

export function getDefaultPrivateRouteHref(permissionPayload: unknown, fallback: string = DEFAULT_PRIVATE_ROUTE_FALLBACK): string {
  return selectDefaultPrivateRouteHref(getMobileRouteCatalog(), permissionPayload, fallback)
}
