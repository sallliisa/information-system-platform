import services from '@/utils/services'
import { defineAsyncComponent } from 'vue'
import { toast } from 'vue-sonner'
import { parseURL } from './common'

export function defaultBeforeSubmit({ formData }: { formData: object }) {
  return formData
}

export async function defaultOnSubmit({ payload, method, targetAPI, type }: { payload: object; method: 'put' | 'post'; targetAPI: string; type: 'create' | 'update' }): Promise<object> {
  try {
    console.log('mm', method)
    let res
    if (type === 'create') res = await services[method](parseURL(targetAPI, '', '/create'), payload)
    else if (type === 'update') res = await services[method](parseURL(targetAPI, '', '/update'), payload)
    else throw new Error(`Unrecognized type: ${type}`)
    return res
  } catch (err: any) {
    throw new Error(err)
  }
}

export function defaultOnSuccess({ payload, response }: { payload: object; response: object }) {
  return { payload, response }
}

export function defaultOnError({ payload, error }: { payload: object; error: any }) {
  return { payload, error }
}

export async function defaultFormGetData({ getAPI, id, searchParameters }: { getAPI: string; id?: string | number; searchParameters?: object }) {
  try {
    if (!id) return
    const { data } = await services.detail(getAPI, id, searchParameters || {})
    return data
  } catch (error: any) {
    toast.error(`Gagal mengambil data: ${error.data?.message || error}`)
  }
}

export const componentTypeMap = {
  text: defineAsyncComponent(() => import('@/components/inputs/TextInput.vue')),
  textarea: defineAsyncComponent(() => import('@/components/inputs/TextareaInput.vue')),
  password: defineAsyncComponent(() => import('@/components/inputs/PasswordInput.vue')),
  file: defineAsyncComponent(() => import('@/components/inputs/FileInput.vue')),
  image: defineAsyncComponent(() => import('@/components/inputs/ImageInput.vue')),
  select: defineAsyncComponent(() => import('@/components/inputs/SelectInput.vue')),
  radio: defineAsyncComponent(() => import('@/components/inputs/RadioGroupInput.vue')),
  date: defineAsyncComponent(() => import('@/components/inputs/DateInput.vue')),
  daterange: defineAsyncComponent(() => import('@/components/inputs/DateRangeInput.vue')),
  month: defineAsyncComponent(() => import('@/components/inputs/MonthInput.vue')),
  year: defineAsyncComponent(() => import('@/components/inputs/YearInput.vue')),
  tag: defineAsyncComponent(() => import('@/components/inputs/TagInput.vue')),
  currency: defineAsyncComponent(() => import('@/components/inputs/CurrencyInput.vue')),
  switch: defineAsyncComponent(() => import('@/components/inputs/Switch.vue')),
  checkbox: defineAsyncComponent(() => import('@/components/inputs/CheckboxInput.vue')),
  lookup: defineAsyncComponent(() => import('@/components/inputs/LookupInput.vue')),
  'master-lookup': defineAsyncComponent(() => import('@/components/inputs/MasterLookupInput.vue')),
  location: defineAsyncComponent(() => import('@/components/inputs/LocationInput.vue')),
  'multi-location': defineAsyncComponent(() => import('@/components/inputs/MultiLocationInput.vue')),
  'rich-text': defineAsyncComponent(() => import('@/components/inputs/RichTextInput.vue')),
  'icon-select': defineAsyncComponent(() => import('@/components/inputs/IconSelectInput.vue')),
  table: defineAsyncComponent(() => import('@/components/inputs/TableInput.vue')),
  time: defineAsyncComponent(() => import('@/components/inputs/TimeInput.vue')),
  'dynamic-form': defineAsyncComponent(() => import('@/components/inputs/DynamicFormInput.vue')),
  number: defineAsyncComponent(() => import('@/components/inputs/NumberInput.vue')),
  'checkbox-group': defineAsyncComponent(() => import('@/components/inputs/CheckboxGroupInput.vue')),
  separator: defineAsyncComponent(() => import('@/components/inputs/FormSeparator.vue')),
  canvas: defineAsyncComponent(() => import('@/components/inputs/DrawingCanvas.vue')),
  'file-manager': defineAsyncComponent(() => import('@/components/inputs/FileManager/FileManagerInput.vue')),
  'iso-clause': defineAsyncComponent(() => import('@/components/inputs/ISOClauseInput.vue')),
}
