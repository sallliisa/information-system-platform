import { buildDetailConfig, buildFormConfig, buildListConfig, type CreateConfig, type ListConfig, type UpdateConfig } from '@southneuhof/is-data-model'
import { defaultDetailConfig, defaultFormConfig, defaultTableConfig } from '../../../configs/_defaults'
import type { MobileModelConfig } from '../catalog.types'

export function buildMobileListConfig(config: MobileModelConfig): ListConfig {
  return buildListConfig(config, {
    fieldsAlias: defaultTableConfig.fieldsAlias,
    fieldsClass: defaultTableConfig.fieldsClass,
    fieldsHeaderClass: defaultTableConfig.fieldsHeaderClass,
    fieldsParse: defaultTableConfig.fieldsParse,
    fieldsProxy: defaultTableConfig.fieldsProxy,
    fieldsType: defaultTableConfig.fieldsType,
    fieldsAlign: defaultTableConfig.fieldsAlign,
  })
}

export function buildMobileDetailConfig(config: MobileModelConfig) {
  return buildDetailConfig(config, {
    fieldsAlias: defaultDetailConfig.fieldsAlias,
    fieldsParse: defaultDetailConfig.fieldsParse,
    fieldsProxy: defaultDetailConfig.fieldsProxy,
    fieldsType: defaultDetailConfig.fieldsType,
  })
}

export function buildMobileCreateFormConfig(config: MobileModelConfig): CreateConfig {
  return buildFormConfig(config, 'create', {
    fieldsAlias: defaultFormConfig.fieldsAlias,
    inputConfig: defaultFormConfig.inputConfig,
  }) as CreateConfig
}

export function buildMobileUpdateFormConfig(config: MobileModelConfig): UpdateConfig {
  return buildFormConfig(config, 'update', {
    fieldsAlias: defaultFormConfig.fieldsAlias,
    inputConfig: defaultFormConfig.inputConfig,
  }) as UpdateConfig
}
