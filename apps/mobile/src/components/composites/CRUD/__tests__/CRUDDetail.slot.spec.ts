import { describe, expect, it, vi } from 'vitest'
import { renderDetailUnderSlot } from '../../../../features/routes/detail-slot'
import type { MobileModelConfig } from '../../../../features/routes/catalog.types'

describe('CRUDDetail detailUnder slot', () => {
  it('invokes detailUnder slot with { data, config }', () => {
    const slot = vi.fn(() => 'slot-rendered')
    const config: MobileModelConfig = {
      name: 'users',
      title: 'Users',
      view: {
        detail: {
          slots: {
            detailUnder: slot,
          },
        },
      },
    }

    const data = { id: 123, username: 'john' }
    const rendered = renderDetailUnderSlot(config, data)

    expect(rendered).toBe('slot-rendered')
    expect(slot).toHaveBeenCalledTimes(1)
    expect(slot).toHaveBeenCalledWith({ data, config })
  })

  it('returns null when no slot is configured', () => {
    const config: MobileModelConfig = {
      name: 'users',
      title: 'Users',
    }

    expect(renderDetailUnderSlot(config, { id: 1 })).toBeNull()
  })
})
