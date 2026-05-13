<script setup lang="ts">
import RadioGroup from '@southneuhof/is-vue-framework/components/inputs/RadioGroupInput.vue'
import services from '@southneuhof/is-vue-framework/services'
import { onMounted, ref, type PropType } from 'vue'

const props = defineProps({
  templateAPI: { type: String, required: true },
  component: { type: Object as PropType<any>, required: true },
  props: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  view: { type: String, default: 'name' },
  model: { type: String, default: 'value' },
})

const modelValue = defineModel<any>()
onMounted(() => {
  if (!modelValue.value)
    services.get(props.templateAPI).then((res) => {
      modelValue.value = res.data
    })
})
</script>

<template>
  <div v-if="modelValue" class="flex flex-col gap-8">
    <component :is="props.component" v-for="item in modelValue" :label="item[view]" v-model="item[model]" v-bind="props.props" />
  </div>
</template>
