import { describe, expect, it } from 'vitest'
import { baseDefaultsConfigBundle } from '../defaults'
import { mergeDefaultsConfig } from '../mergeDefaultsConfig'
import { resolveDefaultsConfig } from '../runtime'
import type { DeepPartial, DefaultsConfigBundle } from '../types'

describe('config-meta runtime helpers', () => {
  it('deep merges objects while replacing scalar and array values', () => {
    const base = {
      nested: {
        first: 1,
        second: 2,
      },
      list: [1, 2, 3],
      label: 'base',
    }

    const result = mergeDefaultsConfig(base, {
      nested: {
        second: 9,
      },
      list: [9],
      label: 'override',
    })

    expect(result).toEqual({
      nested: {
        first: 1,
        second: 9,
      },
      list: [9],
      label: 'override',
    })

    expect(base).toEqual({
      nested: {
        first: 1,
        second: 2,
      },
      list: [1, 2, 3],
      label: 'base',
    })
  })

  it('resolves mobile overrides without mutating shared defaults', () => {
    const override: DeepPartial<DefaultsConfigBundle> = {
      table: {
        fieldsAlias: {
          name: 'Nama Override',
        },
      },
      global: {
        fieldsType: {
          active: {
            type: 'chip',
            props: {
              options: {
                true: { color: 'success', label: 'Enabled' },
              },
            },
          },
        },
      },
    }

    const resolved = resolveDefaultsConfig(override)

    expect(resolved.table.fieldsAlias.name).toBe('Nama Override')
    expect(baseDefaultsConfigBundle.table.fieldsAlias.name).toBe('Nama')

    expect(resolved.global.fieldsType.active.props?.options?.true?.label).toBe('Enabled')
    expect(baseDefaultsConfigBundle.global.fieldsType.active.props?.options?.true?.label).toBe('Aktif')
  })
})
