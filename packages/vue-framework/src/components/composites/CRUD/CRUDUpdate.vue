<script setup lang="ts">
import { toast } from 'vue-sonner'
import { buildFormConfig, type ModelConfig } from '@repo/model-meta'
import Form from '../Form.vue'
import { useRoute, useRouter } from 'vue-router'
import { defaultFormConfig } from '@/app/configs/_defaults'

const props = defineProps<{
  config: ModelConfig
  permissions: CRUDPermissions
}>()

const [route, router] = [useRoute(), useRouter()]

if (!props.config.title) props.config.title = String(route.meta.title)

const updateFormConfig: UpdateConfig = buildFormConfig(props.config, 'update', {
  fieldsAlias: defaultFormConfig.fieldsAlias,
}) as UpdateConfig
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
