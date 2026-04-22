import type { MobileCatalogEntry, MobileRouteCatalog } from './catalog.types'

export type MobileMenuGroup = {
  moduleSlug: string
  moduleName: string
  moduleDescription: string
  moduleIcon?: string
  entries: MobileCatalogEntry[]
}

export function normalizeMenuSearchValue(value: string): string {
  return value.trim().toLowerCase()
}

export function filterMenuEntries(entries: MobileCatalogEntry[], query: string): MobileCatalogEntry[] {
  const normalizedQuery = normalizeMenuSearchValue(query)
  if (!normalizedQuery) return entries

  return entries.filter((entry) => {
    return (
      normalizeMenuSearchValue(entry.config.title).includes(normalizedQuery) ||
      normalizeMenuSearchValue(entry.config.description || '').includes(normalizedQuery) ||
      normalizeMenuSearchValue(entry.module.name).includes(normalizedQuery) ||
      normalizeMenuSearchValue(entry.module.description || '').includes(normalizedQuery)
    )
  })
}

export function formatGroupTitle(value: string): string {
  const normalized = value.trim()
  if (!normalized) return 'General'

  return normalized
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function buildMenuGroups(catalog: MobileRouteCatalog, entries: MobileCatalogEntry[]): MobileMenuGroup[] {
  const visibleEntryKeys = new Set(entries.map((entry) => entry.key))

  return catalog.modules
    .map((moduleGroup) => {
      const filteredEntries = moduleGroup.entries.filter((entry) => visibleEntryKeys.has(entry.key))
      return {
        moduleSlug: moduleGroup.moduleSlug,
        moduleName: moduleGroup.module.name,
        moduleDescription: moduleGroup.module.description || '',
        moduleIcon: moduleGroup.module.icon,
        entries: filteredEntries,
      }
    })
    .filter((group) => group.entries.length > 0)
}

export function chunkItems<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }
  return chunks
}
