<script setup lang="ts">
import Popover from '@/components/base/Popover.vue'
import SearchBox from '../SearchBox.vue'
import { onMounted, ref } from 'vue'
import { keyManager } from '@/stores/keyManager'
import Table from '../Table.vue'
import ConfirmationModal from '../ConfirmationModal.vue'
import Switch from '@/components/inputs/Switch.vue'
import { useRoute, useRouter } from 'vue-router'
import { defaultOnExport, defaultOnDragChange, onDelete } from '@/app/actions/CRUD/CRUDList'
import Form from '../Form.vue'
import services from '@/utils/services'
import Modal from '@/components/base/Modal.vue'
import { defaultTableConfig } from '@/app/configs/_defaults'

const props = defineProps<{
  config: CRUDCompositeConfig
  permissions: CRUDPermissions
}>()

const [route, router] = [useRoute(), useRouter()]

if (!props.config.title) props.config.title = String(route.meta.title)

const searchParameters = ref<Record<string, any>>({})
const visibleFields = ref<Record<string, boolean>>({})

const listConfig = ref<ListConfig>({
  uid: props.config.view?.list?.uid || 'id',
  getAPI: props.config.view?.list?.getAPI || props.config.view?.getAPI || props.config.modelAPI || props.config.name,
  fields: props.config.view?.list?.fields || props.config.view?.fields || props.config.fields || [],
  fieldsAlias: { ...defaultTableConfig.fieldsAlias, ...(props.config.view?.list?.fieldsAlias || props.config.view?.fieldsAlias || props.config.fieldsAlias) },
  fieldsDictionary: props.config.view?.list?.fieldsDictionary || props.config.view?.fieldsDictionary,
  fieldsParse: props.config.view?.list?.fieldsParse || props.config.view?.fieldsParse,
  fieldsClass: props.config.view?.list?.fieldsClass,
  fieldsHeaderClass: props.config.view?.list?.fieldsHeaderClass,
  fieldsAlign: props.config.view?.list?.fieldsAlign,
  fieldsProxy: props.config.view?.list?.fieldsProxy || props.config.view?.fieldsProxy,
  fieldsType: props.config.view?.list?.fieldsType || props.config.view?.fieldsType,
  fieldsUnit: props.config.view?.list?.fieldsUnit || props.config.view?.fieldsUnit,
  toggleableFields: props.config.view?.list?.toggleableFields,
  searchParameters: props.config.view?.list?.searchParameters || props.config.view?.searchParameters,
  draggable: props.config.view?.list?.draggable,
  onDragChange:
    props.config.view?.list?.onDragChange || ((event: any) => defaultOnDragChange(props.config.view?.list?.getAPI || props.config.view?.getAPI || props.config.modelAPI || props.config.name, event)),
  export: {
    allow: props.config.view?.list?.export?.allow || true,
    exportAPI: props.config.view?.list?.export?.exportAPI || props.config.view?.list?.getAPI || props.config.view?.getAPI || props.config.modelAPI || props.config.name,
    onExport: props.config.view?.list?.export?.onExport || defaultOnExport,
    fieldsDictionary: props.config.view?.list?.export?.fieldsDictionary || props.config.view?.list?.fieldsDictionary || props.config.view?.fieldsDictionary,
    fieldsParse: props.config.view?.list?.export?.fieldsParse || props.config.view?.list?.fieldsParse || props.config.view?.fieldsParse,
    fieldsProxy: props.config.view?.list?.export?.fieldsProxy || props.config.view?.list?.fieldsProxy || props.config.view?.fieldsProxy,
    fieldsType: props.config.view?.list?.export?.fieldsType || props.config.view?.list?.fieldsType || props.config.view?.fieldsType,
    fieldsUnit: props.config.view?.list?.export?.fieldsUnit || props.config.view?.list?.fieldsUnit || props.config.view?.fieldsUnit,
  },
})

const filterProps = {
  fields: props.config.view?.list?.filter?.fields,
  fieldsAlias: listConfig.value.fieldsAlias,
  inputConfig: {
    ...props.config.view?.list?.filter?.inputConfig,
    active: {
      type: 'radio',
      props: {
        required: true,
        data: [
          { name: 'Aktif', id: true },
          { name: 'Nonaktif', id: false },
        ],
      },
    },
  },
}

function handleVisibleFields(field: string, enable: boolean) {
  if (!listConfig.value.fields) return
  if (enable) {
    listConfig.value.fields.push(field)
    listConfig.value.fields = listConfig.value.fields
  } else listConfig.value.fields = listConfig.value.fields.filter((item) => item !== field)
}

onMounted(() => {
  Object.keys(route.query).forEach((key) => {
    if (key.includes('_datafilter')) {
      key = key.replace('_datafilter', '')
      Object.assign(searchParameters.value, { [key]: route.query[key] })
    }
  })
})
</script>

<template>
  <div class="flex h-full flex-col gap-2 overflow-hidden">
    <Card class="flex-shrink-0">
      <div class="flex flex-col gap-4">
        <div class="flex w-full flex-row flex-wrap items-center justify-between gap-4">
          <slot v-if="$slots['list-view-title']" name="list-view-title" v-bind="{ title: config.title }" />
          <div v-else class="flex flex-row items-center gap-4">
            <div class="flex flex-row items-center gap-4">
              <div class="flex flex-row items-center gap-6">
                <h1 class="min-w-max text-xl font-semibold">{{ config.title || $route.meta.title }}</h1>
                <SearchBox v-model="searchParameters.search" />
              </div>
              <slot v-if="$slots['list-view-header-action']" name="list-view-header-action" />
            </div>
          </div>
          <div class="flex flex-row gap-4" :class="(config.actions?.create ?? true) && !$slots.createButton ? 'divide-x divide-outline/[24%] ' : ''">
            <div class="flex flex-row flex-nowrap gap-4">
              <div class="flex items-center justify-between gap-4">
                <div class="flex flex-row gap-4">
                  <Tooltip>
                    <template #trigger>
                      <Popover v-if="config.view?.list?.filter?.fields?.length" :ignore="['#form-lookup']">
                        <template #trigger>
                          <Button size="square">
                            <Icon name="filter" />
                          </Button>
                        </template>
                        <template #content>
                          <Card class="w-[350px] outline outline-1 outline-outline" color="surface">
                            <Form :key="keyManager().value[`sys_${config.name}_name`]" static v-model="searchParameters" v-bind="(filterProps as any)" />
                            <Button
                              @click="
                                () => {
                                  searchParameters = { search: searchParameters.search }
                                  keyManager().triggerChange(`sys_${config.name}_name`)
                                }
                              "
                            >
                              Reset Filter
                            </Button>
                          </Card>
                        </template>
                      </Popover>
                    </template>
                    <template #content>Filter Data</template>
                  </Tooltip>
                  <Tooltip>
                    <template #trigger>
                      <Modal :title="`Atur Kolom Tabel ${config.title}`">
                        <template #trigger>
                          <Button size="square">
                            <Icon name="table" />
                          </Button>
                        </template>
                        <template #content>
                          <div class="grid grid-cols-3 gap-8">
                            <div v-for="field in Object.keys(visibleFields)" class="flex max-h-fit flex-row items-center gap-4">
                              <Switch v-model="visibleFields[field]" :onDeactive="() => handleVisibleFields(field, false)" :onActive="() => handleVisibleFields(field, true)" />
                              <div>{{ listConfig.fieldsAlias?.[field] || field }}</div>
                            </div>
                          </div>
                        </template>
                      </Modal>
                    </template>
                    <template #content>Atur Kolom</template>
                  </Tooltip>
                  <Tooltip>
                    <template #trigger>
                      <Button
                        v-if="listConfig.export?.allow"
                        size="square"
                        @click="() => listConfig.export?.onExport?.({ exportAPI: listConfig.export?.exportAPI!, params: searchParameters, listConfig: listConfig })"
                      >
                        <Icon name="file-excel"></Icon>
                      </Button>
                    </template>
                    <template #content>Export Data</template>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div v-if="(config.actions?.create ?? true) && permissions.create" class="flex items-center pl-4">
              <slot v-if="$slots['list-createButton']" name="list-createButton" v-bind="{ listConfig }"> </slot>
              <Button v-else @click="() => router.push({ name: String(route.name), query: { ...route.query, [`${config.name}_view`]: 'create' } })"> <Icon name="add"></Icon>Tambah </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <slot v-if="$slots['list-dashboard']" name="list-dashboard" v-bind="{ queryParameters: { ...listConfig.searchParameters, ...searchParameters } }" />
      <Transition name="vfade" mode="out-in" class="flex-1">
        <Suspense :timeout="0" class="h-full">
          <template #fallback>
            <div class="flex h-full items-center justify-center">
              <Spinner />
            </div>
          </template>
          <div class="flex h-full flex-col">
            <slot v-if="$slots['list-view']" name="list-view" />
            <Card v-else class="flex h-full flex-col">
              <div class="min-h-0 flex-1 overflow-auto">
                <Table
                  :key="keyManager().value[`${config.name}_table`]"
                  v-bind="listConfig"
                  :fields="listConfig.fields!"
                  :searchParameters="{ ...listConfig.searchParameters, ...searchParameters }"
                  paginated
                  sortable
                  hoverEffect
                  :onDataLoaded="(data: Array<any>) => {
                    visibleFields = listConfig.toggleableFields ? Object.fromEntries(listConfig.toggleableFields.map(field => [field, (listConfig.fields ?? []).includes(field)])) : data[0] ? Object.fromEntries(Object.keys(data[0]).filter(field => !!listConfig.fieldsAlias?.[field]).map((field) => [field, (listConfig.fields ?? []).includes(field)])) : {}
                  }"
                  class="max-h-[calc(100vh-230px)] overflow-auto"
                >
                  <template v-for="slotname in Object.keys($slots)" v-slot:[String(slotname)]="data">
                    <slot v-if="slotname.slice(0, 5) === 'list-'" :name="slotname" v-bind="(data as any)"></slot>
                  </template>
                  <template #list-rowActions="{ data }">
                    <slot v-if="$slots['list-rowActions']" v-bind="{ data }"></slot>
                    <div v-else-if="data?.[listConfig.uid!]" class="flex flex-row items-center gap-2">
                      <Button
                        v-if="(config.actions?.detail ?? true) && permissions.detail"
                        color="info"
                        size="square"
                        @click="() => router.push({ name: String(route.name), query: { ...route.query, [`${config.name}_view`]: 'detail', [`${config.name}_id`]: data[listConfig.uid!] } })"
                      >
                        <Icon name="information"></Icon>
                      </Button>
                      <Button
                        v-if="(config.actions?.update ?? true) && data.can_update != false && permissions.update"
                        color="warning"
                        size="square"
                        @click="() => router.push({ name: String(route.name), query: { ...route.query, [`${config.name}_view`]: 'update', [`${config.name}_id`]: data[listConfig.uid!] } })"
                      >
                        <Icon name="edit"></Icon>
                      </Button>
                      <ConfirmationModal
                        v-if="(config.actions?.delete ?? true) && data.can_delete != false && permissions.delete"
                        :onConfirm="async () => await onDelete(config.name, data[listConfig.uid!], `${config.name}_table`)"
                      >
                        <template #trigger>
                          <Button size="square" color="error">
                            <Icon name="delete-bin"></Icon>
                          </Button>
                        </template>
                      </ConfirmationModal>
                      <slot v-if="$slots['list-rowAdditionalActions']" name="list-rowAdditionalActions" v-bind="{ data }"></slot>
                    </div>
                  </template>
                </Table>
              </div>
            </Card>
          </div>
        </Suspense>
      </Transition>
    </div>
  </div>
</template>
