import type { MobileModelConfig } from './catalog.types'

export function renderDetailUnderSlot(config: MobileModelConfig, data: Record<string, any>) {
  const detailSlot = config.view?.detail?.slots?.detailUnder
  if (!detailSlot) return null
  return detailSlot({ data, config })
}
