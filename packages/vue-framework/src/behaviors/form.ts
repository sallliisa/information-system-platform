import { defineAsyncComponent } from 'vue'

export function defaultBeforeSubmit({ formData }: { formData: object }) {
  return formData
}

export async function defaultOnSubmit() {
  throw new Error('[vue-framework] defaultOnSubmit is not implemented yet. Pass onSubmit explicitly or install framework services later.')
}

export function defaultOnSuccess({ payload, response }: { payload: object; response: object }) {
  return { payload, response }
}

export function defaultOnError({ payload, error }: { payload: object; error: any }) {
  return { payload, error }
}

export async function defaultFormGetData() {
  throw new Error('[vue-framework] defaultFormGetData is not implemented yet. Pass getData explicitly or install framework services later.')
}

export const componentTypeMap = {
  text: defineAsyncComponent(() => import('@repo/vue-framework/components/inputs/TextInput.vue')),
}
