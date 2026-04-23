import { resolveDefaultsConfig, type DeepPartial, type DefaultsConfigBundle } from '@repo/config-meta'

export const baseMobileDefaultsOverride: DeepPartial<DefaultsConfigBundle> = {}

const resolvedDefaults = resolveDefaultsConfig(baseMobileDefaultsOverride)

export const defaultGlobalConfig = resolvedDefaults.global
export const defaultTableConfig = resolvedDefaults.table
export const defaultDetailConfig = resolvedDefaults.detail
export const defaultFormConfig = resolvedDefaults.form