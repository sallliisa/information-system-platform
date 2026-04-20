<script setup lang="ts">
import { keyManager } from '@/stores/keyManager'
import { formGroupCodeMap, moduleNameTitleMap } from '@/utils/common'
import { moduleNameRouteMap } from '@/utils/common'
import { parse } from '@/utils/filter'
import services from '@/utils/services'
import { nextTick } from 'vue'

const { data } = await services.list('notifications', { limit: 99999 })
</script>

<template>
  <div class="flex flex-col gap-4 overflow-y-auto p-0.5">
    <Card
      v-for="item in data"
      interactive
      class="gap-1 outline outline-1 outline-outline/[24%]"
      @click="
        () => {
          $router.push({
            name: `${moduleNameRouteMap[item.module_name] || item.module_name.replace(/_/g, '-')}${['general_transactions', 'hse_transactions'].includes(item.module_name) ? `-${item.period}` : ``}`,
            query: {
              [`${moduleNameRouteMap[item.module_name] || item.module_name.replace(/_/g, '-')}${
                ['general_transactions', 'hse_transactions'].includes(item.module_name) ? `-${item.period}` : ``
              }_view`]: 'detail',
              [`${moduleNameRouteMap[item.module_name] || item.module_name.replace(/_/g, '-')}${['general_transactions', 'hse_transactions'].includes(item.module_name) ? `-${item.period}` : ``}_id`]:
                item.module_id,
              [`inspection-damages_tab`]: item.module_name === 'inspection_items' || item.module_name === 'permit_tickets' ? '0' : item.module_name === 'minor_asset_damages' ? '1' : undefined,
              ['inspection-major-damages_view']: ['inspection_items', 'permit_tickets'].includes(item.module_name) ? 'detail' : undefined,
              ['inspection-major-damages_id']: ['inspection_items', 'permit_tickets'].includes(item.module_name) ? item.module_id : undefined,
              [`inspection-minor-damages_view`]: ['minor_asset_damages'].includes(item.module_name) ? 'detail' : undefined,
              [`inspection-minor-damages_id`]: ['minor_asset_damages'].includes(item.module_name) ? item.module_id : undefined,
              'incident-submenu_tab_code': formGroupCodeMap[item.form_group_code] || undefined,
            },
          })
          nextTick(() => {
            keyManager().triggerChange('app-notifications-drawer')
          })
        }
      "
    >
      <div class="flex flex-col">
        <p class="text-sm font-bold text-muted">{{ moduleNameTitleMap[item.module_name] }}</p>
        <div class="flex flex-row items-center gap-2">
          <p>
            <span class="font-bold">{{ item.title }}</span> ⋅ <span class="text-sm font-semibold text-muted">{{ parse('date', item.created_at) }}</span>
          </p>
        </div>
      </div>
      <p>{{ item.content }}</p>
      <!-- <p class="text-muted text-sm font-semibold">{{ item.rel_division_id_name }} ⋅ {{ item.rel_project_id_name }}</p> -->
    </Card>
  </div>
</template>
