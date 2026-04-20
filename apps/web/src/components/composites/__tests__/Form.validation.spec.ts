import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import type { InputConfig } from '@repo/model-meta'
import Form from '@/components/composites/Form.vue'
import BaseInput from '@/components/inputs/BaseInput.vue'

vi.hoisted(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
    },
  })
})

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({ query: {} }),
  }
})

vi.mock('@/stores/keyManager', () => ({
  keyManager: () => ({
    value: {},
    triggerChange: () => undefined,
  }),
}))

const TextFieldInput = defineComponent({
  components: { BaseInput },
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    field: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'validation:touch'],
  template: `
    <BaseInput :label="label" :field="field">
      <input
        :data-testid="'input-' + field"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('validation:touch')"
      />
    </BaseInput>
  `,
})

const ToggleInput = defineComponent({
  components: { BaseInput },
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: '' },
    field: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'validation:touch'],
  template: `
    <BaseInput :label="label" :field="field">
      <button :data-testid="'toggle-' + field" @click="$emit('update:modelValue', !modelValue); $emit('validation:touch')">toggle</button>
    </BaseInput>
  `,
})

const TouchOnlyInput = defineComponent({
  components: { BaseInput },
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    field: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'validation:touch'],
  template: `
    <BaseInput :label="label" :field="field">
      <button :data-testid="'commit-' + field" @click="$emit('validation:touch')">commit</button>
    </BaseInput>
  `,
})

const globalStubs = {
  Card: { template: '<div><slot /></div>' },
  Button: { template: '<button><slot /></button>' },
  Spinner: { template: '<div>spinner</div>' },
  Icon: { template: '<i />' },
}

async function flushFormRender() {
  await Promise.resolve()
  await Promise.resolve()
}

function mountForm(options: {
  fields: string[]
  inputConfig: InputConfig
  onSubmit?: any
  getInitialData?: () => Promise<Record<string, any>>
}) {
  return mount(Form, {
    props: {
      fields: options.fields,
      inputConfig: options.inputConfig,
      getInitialData: options.getInitialData ?? (async () => ({})),
      onSubmit: options.onSubmit ?? (async () => ({})),
      targetAPI: 'mock-api',
    },
    global: {
      stubs: globalStubs,
    },
  })
}

describe('Form validation integration', () => {
  it('shows no error before first blur and shows after blur', async () => {
    const wrapper = mountForm({
      fields: ['name'],
      inputConfig: {
        name: {
          type: 'custom',
          component: TextFieldInput,
          props: { validation: ['required'] },
        },
      },
    })

    await flushFormRender()
    expect(wrapper.text()).not.toContain('Harus diisi!')

    await wrapper.get('[data-testid="input-name"]').trigger('blur')
    expect(wrapper.text()).toContain('Harus diisi!')
  })

  it('clears error after valid value and revalidation', async () => {
    const wrapper = mountForm({
      fields: ['name'],
      inputConfig: {
        name: {
          type: 'custom',
          component: TextFieldInput,
          props: { validation: ['required'] },
        },
      },
    })

    await flushFormRender()
    const input = wrapper.get('[data-testid="input-name"]')

    await input.trigger('blur')
    expect(wrapper.text()).toContain('Harus diisi!')

    await input.setValue('John')
    await input.trigger('blur')
    expect(wrapper.text()).not.toContain('Harus diisi!')
  })

  it('validates untouched visible fields on submit', async () => {
    const wrapper = mountForm({
      fields: ['name'],
      inputConfig: {
        name: {
          type: 'custom',
          component: TextFieldInput,
          props: { validation: ['required'] },
        },
      },
    })

    await flushFormRender()
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Harus diisi!')
  })

  it('skips hidden dependency fields and clears stale errors', async () => {
    const onSubmit = vi.fn(async () => ({}))

    const wrapper = mountForm({
      fields: ['show_secret', 'secret'],
      onSubmit,
      getInitialData: async () => ({ show_secret: false, secret: '' }),
      inputConfig: {
        show_secret: {
          type: 'custom',
          component: ToggleInput,
        },
        secret: {
          type: 'custom',
          component: TextFieldInput,
          props: { validation: ['required'] },
          dependency: {
            fields: ['show_secret'],
            visibility: {
              default: false,
              validator: ({ show_secret }: Record<string, any>) => Boolean(show_secret),
            },
          },
        },
      },
    })

    await flushFormRender()

    await wrapper.get('[data-testid="toggle-show_secret"]').trigger('click')
    await wrapper.get('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Harus diisi!')

    await wrapper.get('[data-testid="toggle-show_secret"]').trigger('click')
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).not.toContain('Harus diisi!')
    expect(onSubmit).toHaveBeenCalled()
    const payload = (onSubmit as any).mock.calls.at(-1)?.[0]?.payload
    expect(payload?.secret).toBeNull()
  })

  it('supports validation:touch for non-blur widgets', async () => {
    const wrapper = mountForm({
      fields: ['custom_field'],
      inputConfig: {
        custom_field: {
          type: 'custom',
          component: TouchOnlyInput,
          props: { validation: ['required'] },
        },
      },
    })

    await flushFormRender()
    await wrapper.get('[data-testid="commit-custom_field"]').trigger('click')
    expect(wrapper.text()).toContain('Harus diisi!')
  })
})
