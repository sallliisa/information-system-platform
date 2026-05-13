import { defineAsyncComponent } from 'vue'
import services from '@southneuhof/is-vue-framework/services'
import { parseURL } from '@southneuhof/is-vue-framework/behaviors/common'

export function defaultBeforeSubmit({ formData }: { formData: object }) {
  return formData
}

export async function defaultOnSubmit({ payload, method, targetAPI, type }: { payload: object; method: 'put' | 'post'; targetAPI: string; type: 'create' | 'update' }) {
  if (type === 'create') return services[method](parseURL(targetAPI, '', '/create'), payload)
  if (type === 'update') return services[method](parseURL(targetAPI, '', '/update'), payload)
  throw new Error(`[vue-framework] Unrecognized submit type: ${type}`)
}

export function defaultOnSuccess({ payload, response }: { payload: object; response: object }) {
  return { payload, response }
}

export function defaultOnError({ payload, error }: { payload: object; error: any }) {
  return { payload, error }
}

export async function defaultFormGetData({ getAPI, id, searchParameters }: { getAPI: string; id?: string | number; searchParameters?: object }) {
  if (!id) return
  const { data } = await services.detail(getAPI, id, searchParameters || {})
  return data
}

export const componentTypeMap = {
  text: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/TextInput.vue')),
  textarea: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/TextareaInput.vue')),
  password: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/PasswordInput.vue')),
  file: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/FileInput.vue')),
  image: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/ImageInput.vue')),
  select: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/SelectInput.vue')),
  radio: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/RadioGroupInput.vue')),
  date: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/DateInput.vue')),
  daterange: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/DateRangeInput.vue')),
  month: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/MonthInput.vue')),
  year: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/YearInput.vue')),
  tag: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/TagInput.vue')),
  currency: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/CurrencyInput.vue')),
  switch: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/Switch.vue')),
  checkbox: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/CheckboxInput.vue')),
  lookup: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/LookupInput.vue')),
  'master-lookup': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/MasterLookupInput.vue')),
  location: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/LocationInput.vue')),
  'multi-location': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/MultiLocationInput.vue')),
  'rich-text': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/RichTextInput.vue')),
  'icon-select': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/IconSelectInput.vue')),
  table: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/TableInput.vue')),
  time: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/TimeInput.vue')),
  'dynamic-form': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/DynamicFormInput.vue')),
  number: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/NumberInput.vue')),
  'checkbox-group': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/CheckboxGroupInput.vue')),
  separator: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/FormSeparator.vue')),
  canvas: defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/DrawingCanvas.vue')),
  'file-manager': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/FileManager/FileManagerInput.vue')),
  'iso-clause': defineAsyncComponent(() => import('@southneuhof/is-vue-framework/components/inputs/ISOClauseInput.vue')),
}
