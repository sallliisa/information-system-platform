<script setup lang="ts">
import SelectInput from './SelectInput.vue'

//  { "type": "master-lookup", "props": { "module": "iso-competencies" }, "label": "test", "helperMessage": "test", "required": true }
const props = defineProps({
  module: {
    type: String,
    required: true,
  },
  multi: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const modelValue = defineModel<any>()
</script>

<template>
  <div>
    <SelectInput :getAPI="`lookup/${props.module}?custom`" :searchParameters="{ module: props.module }" :multi="props.multi" :asWhole="true" v-model="modelValue" pick="name" />
  </div>
</template>
