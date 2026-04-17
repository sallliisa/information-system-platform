<script setup lang="ts">
import { toast } from 'vue-sonner'
import Form from '../Form.vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import services from '@/utils/services'
import FormGuideViewer from './_layouts/FormGuideViewer.vue'
import { defaultFormConfig } from '@/app/configs/_defaults'

const props = defineProps<{
  config: CRUDCompositeConfig
  permissions: CRUDPermissions
}>()

const [route, router] = [useRoute(), useRouter()]

if (!props.config.title) props.config.title = String(route.meta.title)

const updateFormConfig: UpdateConfig = {
  fields: props.config.transaction?.update?.fields || props.config.transaction?.create?.fields || props.config.transaction?.fields || props.config.fields || [],
  getAPI: props.config.transaction?.update?.getAPI || props.config.name || String(route.name),
  targetAPI: props.config.transaction?.update?.targetAPI || props.config.transaction?.create?.targetAPI || props.config.transaction?.targetAPI || props.config.name,
  fieldsAlias: {
    ...defaultFormConfig.fieldsAlias,
    ...(props.config.transaction?.update?.fieldsAlias || props.config.transaction?.create?.fieldsAlias || props.config.transaction?.fieldsAlias || props.config.fieldsAlias),
  },
  inputConfig: props.config.transaction?.update?.inputConfig || props.config.transaction?.create?.inputConfig || props.config.transaction?.inputConfig,
  extraData: props.config.transaction?.update?.extraData || props.config.transaction?.create?.extraData || props.config.transaction?.extraData,
  getInitialData: props.config.transaction?.update?.getInitialData || props.config.transaction?.create?.getInitialData || props.config.transaction?.getInitialData,
  validation: props.config.transaction?.update?.validation || props.config.transaction?.create?.validation || props.config.transaction?.validation,
  searchParameters: props.config.transaction?.update?.searchParameters,
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <slot v-if="$slots['create-header']" name="create-header"></slot>
    <Card v-else class="flex flex-row items-center justify-between gap-4">
      <div class="flex flex-row items-center gap-4">
        <Button
          @click="() => ($route.query['redirected'] == 'true' ? $router.back() : $router.push({ query: { ...$route.query, [`${config.name}_view`]: 'list' } }))"
          variant="icon"
          size="square"
          class="max-w-fit"
        >
          <Icon name="arrow-left" />
        </Button>
        <div class="min-w-max text-xl">Perbarui {{ config.title || $route.meta.title }}</div>
      </div>
    </Card>
    <Transition name="vfade" mode="out-in">
      <Suspense>
        <template #fallback>
          <div class="flex w-full items-center justify-center">
            <Spinner />
          </div>
        </template>
        <slot v-if="$slots['update-main']" name="update-main" />
        <Card v-else>
          <Form
            v-bind="(updateFormConfig as any)"
            formType="update"
            :dataID="String(route.query[`${props.config.name}_id`])"
            :onSuccess="
              () => {
                toast.success('Berhasil mengubah data!')
                $router.back()
              }
            "
          />
        </Card>
      </Suspense>
    </Transition>
  </div>
</template>
