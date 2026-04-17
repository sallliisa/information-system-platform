<script setup lang="ts">
import { ref, type PropType, watch, provide, onMounted } from 'vue'
import { componentTypeMap, defaultBeforeSubmit, defaultFormGetData, defaultOnError, defaultOnSubmit, defaultOnSuccess } from '@/app/actions/Form'
import { toast } from 'vue-sonner'
import { useRoute } from 'vue-router'
import { componentTypeMap as typeConfigMap } from './common/properties'
import { keyManager } from '@/stores/keyManager'
import { defaultFormConfig } from '@/app/configs/_defaults'

const props = defineProps({
  inputConfig: { type: Object as PropType<InputConfig>, default: () => ({}) },
  fields: { type: Array as PropType<string[]>, required: true },
  fieldsAlias: { type: Object, default: () => ({}) },
  getDetailData: {
    type: Function as PropType<({ getAPI, id, searchParameters }: { getAPI: string; id?: string | number; searchParameters?: object }) => Promise<object>>,
    default: defaultFormGetData,
  },
  getInitialData: { type: Function as PropType<() => Promise<Record<string, any>>>, default: async () => ({}) },
  beforeSubmit: { type: Function as PropType<({ formData }: { formData: object }) => object>, default: defaultBeforeSubmit },
  onSubmit: {
    type: Function as PropType<({ payload, method, targetAPI, type }: { payload: object; method: 'put' | 'post'; targetAPI: string; type: 'create' | 'update' }) => Promise<object | void>>,
    default: defaultOnSubmit,
  },
  onSuccess: { type: Function as PropType<({ formData, res }: { formData: object; res: Record<string, any> }) => void>, default: defaultOnSuccess },
  onError: { type: Function as PropType<({ formData, error }: { formData: object; error: Record<string, any> }) => void>, default: defaultOnError },
  targetAPI: { type: String, default: '' },
  validation: { type: Object as PropType<Record<string, Array<{ message: string; validator: (formData: object) => boolean }>>>, default: () => ({}) },
  getAPI: { type: String },
  dataID: { type: String },
  formType: { type: String as PropType<'create' | 'update'>, default: 'create' },
  method: { type: String as PropType<'put' | 'post'> },
  searchParameters: { type: Object, default: () => ({}) },
  extraData: { type: Object, default: () => ({}) },
  static: { type: Boolean },
  disabled: { type: Boolean },
})

const route = useRoute()

const inputConfig = ref({ ...defaultFormConfig.inputConfig, ...props.inputConfig })
const fieldsAlias = { ...defaultFormConfig.fieldsAlias, ...props.fieldsAlias }
const fieldDependencyTarget = ref<Record<string, string[]>>({})
defineEmits<{ (event: string, ...args: any[]): void }>()
const modelValue = defineModel<any>({ default: () => ({}) })

const formData = ref<Record<string, any>>({
  ...(localStorage.getItem('sys_form_initial_data') ? JSON.parse(localStorage.getItem('sys_form_initial_data')!) : {}),
  ...(route.query['sys_form_initial_data'] ? JSON.parse(String(route.query['sys_form_initial_data'])) : {}),
})

provide('formData', formData)

const formError = ref<Record<string, string>>({})

const loading = ref({
  get: true,
  post: false,
})
const fieldDependencyData = ref<{ [key: string]: FieldDependency }>({})

function buildInputConfig() {
  props.fields.forEach((field) => {
    const fieldInputConfig = inputConfig.value[field]
    if (fieldInputConfig) {
      fieldInputConfig.props ??= {}
      const dependency = fieldInputConfig.dependency
      if (!dependency) return
      fieldDependencyData.value[field] = {
        fields: dependency.fields || [],
        visibility: dependency.visibility ? { ...dependency.visibility, value: undefined } : undefined,
        disabled: dependency.disabled ? { ...dependency.disabled, value: undefined } : undefined,
        props: dependency.props ? { ...dependency.props, value: undefined } : undefined,
        inputConfig: dependency.inputConfig ? { ...dependency.inputConfig } : undefined,
        value: dependency.value ? { ...dependency.value } : undefined,
      }
      const typeConfig = typeConfigMap[fieldInputConfig.type]
      const fieldProps = fieldInputConfig.props
      if (fieldProps && typeConfig?.propKeyValue) {
        Object.assign(
          fieldProps,
          Object.fromEntries(
            typeConfig.propKeyValue.map((property) => [
              property[0],
              (() => {
                const generator = fieldInputConfig.propGenerator?.[property[0]]
                return generator ? generator(formData.value) : property[1]
              })(),
            ])
          )
        )
      }
    }
  })

  for (const entry of Object.entries(fieldDependencyData.value)) {
    for (const field of entry[1].fields) {
      if (!fieldDependencyTarget.value[field]) fieldDependencyTarget.value[field] = []
      fieldDependencyTarget.value[field].push(entry[0])
    }
  }

  Object.keys(fieldDependencyTarget.value).forEach((target) => {
    watch(
      () => formData.value[target],
      () => {
        const dependentFields = fieldDependencyTarget.value[target] || []
        dependentFields.forEach((field) => {
          revalidateFieldDependency(field)
        })
      },
      { immediate: true, deep: true }
    )
  })
}

async function preflight() {
  loading.value.get = true
  formData.value = (await props.getInitialData()) || {}
  if (props.formType === 'update') formData.value = (await props.getDetailData({ getAPI: props.getAPI || '', id: props.dataID, searchParameters: props.searchParameters })) || {}
  if (props.static) {
    watch(
      () => formData.value,
      () => {
        modelValue.value = formData.value
      },
      { deep: true }
    )
    watch(
      () => modelValue.value,
      () => {
        formData.value = modelValue.value
      },
      { deep: true }
    )
    formData.value = modelValue.value
  }
  buildInputConfig()
  loading.value.get = false
}

async function submitForm() {
  formError.value = validate()

  if (Object.values(formError.value).some((error) => error)) {
    toast.error('Masih terdapat data yang kosong atau tidak valid!')
    return
  }

  Object.keys(formData.value).forEach((field) => {
    if (fieldDependencyData.value[field]?.visibility?.value === false) formData.value[field] = null
  })
  const payload = props.beforeSubmit({ formData: { ...formData.value, ...props.extraData } })
  loading.value.post = true
  try {
    const res = await props.onSubmit({ payload, method: props.method || props.formType === 'update' ? 'put' : 'post', targetAPI: props.targetAPI, type: props.formType })
    props.onSuccess({ formData: payload, res: res || {} })
  } catch (error: any) {
    props.onError({ formData: payload, error })
  }
  loading.value.post = false
}

function validate() {
  const formError: Record<string, string> = {}
  for (const field of props.fields) {
    if (fieldDependencyData.value[field]?.visibility?.value === false) {
      continue
    }

    if (inputConfig.value[field]?.props?.required) {
      const fieldValue = formData.value[field]
      if (fieldValue == null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        formError[field] = 'Harus diisi!'
        continue
      }
    }

    if (props.validation[field]) {
      for (const validator of props.validation[field]) {
        if (!validator.validator(formData.value)) {
          formError[field] = validator.message
          break
        }
      }
    }
  }
  return formError
}

function revalidateFieldDependency(field: string) {
  const fieldData = fieldDependencyData.value[field]
  if (!fieldData) return
  const currentInputConfig = inputConfig.value[field]
  if (!currentInputConfig) return

  if (fieldData.value) {
    formData.value[field] = fieldData.value.generator(formData.value)
  }

  if (fieldData.visibility) {
    fieldData.visibility.value = fieldData.visibility.validator?.(Object.fromEntries((fieldData.fields ?? []).map((field) => [field, formData.value[field]]))) ?? fieldData.visibility.default
  }

  if (fieldData.disabled) {
    fieldData.disabled.value = fieldData.disabled.validator?.(Object.fromEntries((fieldData.fields ?? []).map((field) => [field, formData.value[field]]))) ?? fieldData.disabled.default
  }

  if (fieldData.props) {
    fieldData.props.value =
      fieldData.props.generator?.(Object.fromEntries((fieldData.fields ?? []).map((field) => [field, formData.value[field]])), currentInputConfig.props) ?? fieldData.props.default
  }

  if (fieldData.inputConfig) {
    const generated = fieldData.inputConfig.generator?.(Object.fromEntries((fieldData.fields ?? []).map((field) => [field, formData.value[field]]))) ?? fieldData.props?.default

    inputConfig.value[field] = {
      ...currentInputConfig,
      ...generated,
      props: {
        ...currentInputConfig.props,
        ...(generated?.props || {}),
      },
    }

    const nextFieldConfig = inputConfig.value[field]
    if (nextFieldConfig) nextFieldConfig.props ??= {}
  }
  keyManager().triggerChange(field)
}

onMounted(() => {
  preflight()
})

function setFormData(newData: any) {
  formData.value = newData
}

provide('setFormData', setFormData)
</script>

<template>
  <div>
    <div v-if="!loading.get">
      <form @submit.prevent="submitForm" class="grid w-full grid-cols-12 grid-rows-[fit-content] items-center gap-x-2 gap-y-2">
        <template v-for="field in fields" v-show="!fieldDependencyData[field] ? true : !fieldDependencyData[field].visibility ? true : fieldDependencyData[field].visibility.value">
          <div
            v-if="field.slice(0, 2) === 'S|' && (!fieldDependencyData[field] || !fieldDependencyData[field].visibility || fieldDependencyData[field].visibility?.value)"
            class="col-span-12 flex flex-col gap-1"
          >
            <p class="italic text-primary">{{ field.slice(2) }}</p>
            <div class="w-full border-t-[1px] border-t-primary"></div>
          </div>
          <div v-else-if="field.slice(0, 3) === 'S1|'" class="sticky top-[77px] z-10 col-span-12 mb-4 flex flex-col gap-1">
            <Card color="primary-container" class="text-lg font-semibold">{{ field.slice(3) }}</Card>
          </div>
          <template v-else-if="inputConfig[field]">
            <div
              v-if="!fieldDependencyData[field] ? true : !fieldDependencyData[field].visibility ? true : fieldDependencyData[field].visibility?.value"
              class="px-2 py-2"
              :style="{
                gridColumn: `span ${inputConfig[field].colSpan || 12} / span ${inputConfig[field].colSpan || 12}`,
                gridRow: `span ${inputConfig[field].rowSpan || 1} / span ${inputConfig[field].rowSpan || 1}`,
              }"
              :class="fieldDependencyData[field]?.disabled?.value || props.disabled ? 'pointer-events-none cursor-not-allowed rounded-xl bg-surface-container-highest/[38%]' : ''"
            >
              <div v-if="inputConfig[field].type === 'custom'">
                <Suspense :timeout="500">
                  <component
                    enableHelperMessage
                    :key="keyManager().value[field]"
                    :is="inputConfig[field].component"
                    v-model="formData[field]"
                    :formData="formData"
                    :formType="formType"
                    :error="formError[field]"
                    v-bind="{ label: fieldsAlias[field] ?? field, ...inputConfig[field].props, ...fieldDependencyData[field]?.props?.value }"
                  />
                  <template #fallback>
                    <Spinner />
                  </template>
                </Suspense>
              </div>
              <div v-else-if="componentTypeMap[inputConfig[field]?.type]">
                <Suspense :timeout="500">
                  <component
                    enableHelperMessage
                    :class="inputConfig[field].props?.class"
                    :key="keyManager().value[field]"
                    :formData="formData"
                    :is="componentTypeMap[inputConfig[field].type]"
                    v-bind="{ label: fieldsAlias[field] ?? field, ...inputConfig[field].props, ...fieldDependencyData[field]?.props?.value }"
                    v-model="formData[field]"
                    :error="formError[field]"
                  />
                  <template #fallback>
                    <Spinner />
                  </template>
                </Suspense>
              </div>
            </div>
          </template>
          <Card v-else color="warning" class="col-span-12">WARN: inputConfig[{{ field }}] is undefined</Card>
        </template>
        <div v-if="!props.static && !disabled" class="col-span-12 mt-6 flex">
          <Button v-if="!$slots.submitButton" class="max-w-fit" :type="'submit'" :disabled="loading.get || loading.post">Submit</Button>
          <slot v-else name="submitButton" v-bind="{ loading: loading.get || loading.post, submitForm, formData }"></slot>
        </div>
      </form>
    </div>
  </div>
</template>
