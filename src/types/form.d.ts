import type { componentTypeMap } from '@/app/actions/Form'
import type { ValidationRule } from '@/app/actions/validations'
import type { AsyncComponentLoader, Component } from 'vue'

export type FormTypes = keyof typeof componentTypeMap | 'custom'

export type FormControls = {
  visibility?: {
    validator: (val: any) => any
    default?: boolean
  }
  value?: {
    generator: (val: any) => any
    default?: any
  }
  props?: {
    generator: (val: any, currVal: any) => any
    default?: Object
  }
}

type CustomComponentInput = Component | AsyncComponentLoader

export type FormField = {
  type: FormTypes
  component?: CustomComponentInput
  span?: number
  colSpan?: number
  rowSpan?: number
  dependency?: FieldDependency
  props?: Record<string, any> & {
    validation?: ValidationRule[]
  }
  propGenerator?: Record<string, (formData: Record<string, any>) => any>
}
