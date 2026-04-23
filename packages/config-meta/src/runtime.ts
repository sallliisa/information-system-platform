import { baseDefaultsConfigBundle } from './defaults'
import { mergeDefaultsConfig } from './mergeDefaultsConfig'
import type { DeepPartial, DefaultsConfigBundle } from './types'

export function resolveDefaultsConfig(override?: DeepPartial<DefaultsConfigBundle>): DefaultsConfigBundle {
  return mergeDefaultsConfig<DefaultsConfigBundle>(baseDefaultsConfigBundle, override)
}
