<script setup lang="ts">
import { toast } from 'vue-sonner'
import { buildFormConfig, type ModelConfig } from '@repo/model-meta'
import Form from '../Form.vue'
import { useRoute, useRouter } from 'vue-router'
import { bulkCreateFormProps, composeInputTemplateSheet } from '@repo/vue-framework/behaviors/crudCreate'
import Modal from '@/components/base/Modal.vue'
import { defaultFormConfig } from '@/app/configs/_defaults'
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  config: ModelConfig
  permissions: CRUDPermissions
}>()

const [route, router] = [useRoute(), useRouter()]

if (!props.config.title) props.config.title = String(route.meta.title)

const createFormConfig: CreateConfig = buildFormConfig(props.config, 'create', {
  fieldsAlias: defaultFormConfig.fieldsAlias,
}) as CreateConfig
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
        <div class="min-w-max text-xl">Tambah {{ config.title || $route.meta.title }}</div>
      </div>
      <!-- <Modal>
        <template #trigger>
          <Button variant="icon"><Icon name="function-add"></Icon>Bulk Create</Button>
        </template>
        <template #title>
          Bulk Create
        </template>
        <template #content>
          <div class="flex flex-col gap-4">
            <ol class="list-decimal ml-4">
              <li><span class="italic">Download</span> file template <button class="inline-flex text-info" @click="() => composeInputTemplateSheet(createFormConfig)">di sini <Icon class="ml-1" size="md" name="download"></Icon></button></li>
              <li><span class="italic">Upload file template</span> yang sudah terisi di bawah ini</li>
              <li>Tekan <span class="italic font-semibold">submit</span></li>
            </ol>
            <Form
              :fields="['data']"
              :fieldsAlias="{
                data: 'Data'
              }"
              :inputConfig="{
                data: {
                  type: 'custom',
                  component: defineAsyncComponent(() => import('@/components/composites/CRUD/_layouts/SpreadsheetReader.vue')) as any,
                  props: {
                    fields: createFormConfig.fields
                  }
                }
              }"
              :targetAPI="`${createFormConfig.targetAPI}/bulk-create?custom`"
              :onSuccess="createFormConfig.onSuccess ? createFormConfig.onSuccess : () => {
                toast.success('Berhasil menambahkan data!')
                $router.back()
              }"
            />
          </div>
        </template>
      </Modal> -->
    </Card>
    <Transition name="vfade" mode="out-in">
      <Suspense>
        <template #fallback>
          <div class="flex w-full items-center justify-center">
            <Spinner />
          </div>
        </template>
        <slot v-if="$slots['create-main']" name="create-main" />
        <Card v-else>
          <Form
            v-bind="(createFormConfig as any)"
            formType="create"
            :onSuccess="
              createFormConfig.onSuccess
                ? createFormConfig.onSuccess
                : () => {
                    toast.success('Berhasil menambahkan data!')
                    $router.back()
                  }
            "
          />
        </Card>
      </Suspense>
    </Transition>
  </div>
</template>
