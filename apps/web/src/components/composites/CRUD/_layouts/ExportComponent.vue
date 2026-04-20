<script setup lang="ts">
import type { PropType } from 'vue'
import Detail from '../../Detail.vue'
import Table from '../../Table.vue'
import HKALogo from '@/assets/corporate/assets/logo-hka.png'
import HKLogoSVG from '@/assets/corporate/assets/hk-logo.svg'
import BUMNLogo from '@/assets/corporate/assets/bumn-logo.png'
import QRCodeVue from 'qrcode.vue'
import { parse } from '@/utils/filter'

const props = defineProps({
  model: { type: String },
  routeName: { type: String },
  fieldsAlias: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  fieldsType: { type: Object as PropType<Record<string, { type: string; props?: any }>>, default: () => ({}) },
  fieldsProxy: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  fieldsDictionary: { type: Object as PropType<Record<string, Record<string, string>>>, default: () => ({}) },
  fieldsUnit: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  fieldsParse: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  data: { type: Object as PropType<Record<string, any>>, required: true },
  layout: {
    type: Array as PropType<
      {
        type: 'detail' | 'table' | 'image-single' | 'image-multi' | 'paragraph' | 'qr' | 'verification' | 'page-break' | 'custom' | 'staged-attachments'
        title?: string
        sourceKey?: string
        component?: any
        props?: Record<string, any>
      }[][]
    >,
    default: () => [],
  },
  title: String,
})

const _window = window
</script>

<template>
  <!-- {{ `${_window.location.origin}/#/public/certificate?type=verificator&id=${data.id}&model_name=${model}&module=${routeName}` }} -->
  <div v-if="data" class="flex flex-col gap-4">
    <div class="flex flex-row items-center justify-between gap-4 pb-4" :style="{ borderBottom: '1px solid #aaaaaa' }">
      <img :src="HKALogo" :style="{ width: '2cm' }" />
      <div class="flex flex-col items-center justify-center gap-2">
        <p class="text-xl font-bold">PT HAKAASTON</p>
        <div class="flex flex-col items-center justify-center">
          <p>{{ data?.rel_form_id || data?.form_name || data?.rel_activity_id }}</p>
          <p>{{ data?.report_number }}</p>
        </div>
      </div>
      <div :style="{ width: '2cm' }">
        <QRCodeVue :size="64" :value="_window.location.href" />
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <div v-for="(_, dataIndex) in props.layout" class="flex flex-col gap-6">
        <div v-for="section in props.layout[dataIndex]" class="flex flex-col gap-2">
          <div v-if="section.type === 'page-break'" :style="{ pageBreakBefore: 'always' }"></div>
          <p v-if="section.title" class="font-semibold">{{ section.title }}</p>
          <Detail v-if="section.type === 'detail'" v-bind="{...props, ...(section.props as any)}" :data="data" rowGap="0px">
            <template v-for="slotname in Object.keys(section.props?.slots ?? {})" v-slot:[String(slotname)]>
              <component :is="section.props?.slots[slotname]" :data="data" v-bind="{...props, ...(section.props as any)}" />
            </template>
          </Detail>
          <Table v-else-if="section.type === 'table'" v-bind="{...props, ...(section.props as any)}" :data="section.sourceKey ? data[section.sourceKey] : data" />
          <div v-else-if="section.type === 'image-single'" class="flex flex-col items-center justify-center gap-2">
            <img :src="data[section.sourceKey!]?.url" :style="{ width: '100%', height: 'auto', breakInside: 'avoid', maxHeight: '50vh', objectFit: 'cover', objectPosition: 'center' }" />
            <p v-if="section.props?.description">{{ section.props.description }}</p>
          </div>
          <div v-else-if="section.type === 'image-multi'" class="flex flex-col gap-4">
            <div v-for="imageData, index in data[section.sourceKey!]" class="flex flex-col items-center justify-center gap-4" :style="{ breakInside: 'avoid' }">
              <img :src="imageData?.filename?.url" :style="{ width: '100%', height: 'auto', maxHeight: '50vh', objectFit: 'cover', objectPosition: 'center' }" />
              <div v-if="section.props?.fields" class="flex flex-col items-center justify-center">
                <p v-for="field in section.props.fields" class="text-sm italic">{{ imageData[field] }}</p>
              </div>
              <div v-if="(Number(index) + 1) % 3 === 0" :style="{ pageBreakBefore: 'always' }"></div>
            </div>
          </div>
          <div v-else-if="section.type === 'staged-attachments'" class="flex flex-col gap-4">
            <div v-for="stageObject, stageIndex in data[section.sourceKey![0]]" :key="stageIndex" class="flex flex-col gap-4" :style="{ breakInside: 'avoid' }">
              <!-- Assuming each stageObject has an array of images accessible by section.sourceKey[1] -->
              <!-- Or if stageObject itself is the imageData for image-multi logic -->
              <div class="flex flex-col items-center justify-center">
                <p class="text-sm font-bold italic">{{ stageObject.stage }}%</p>
              </div>
              <div v-for="imageData, imgIndex in stageObject[section.sourceKey![1]]" :key="imgIndex" class="flex flex-col items-center justify-center gap-4">
                <img :src="imageData?.filename?.url" :style="{ width: '100%', height: 'auto', maxHeight: '50vh', objectFit: 'cover', objectPosition: 'center' }" />
                <!-- Optional: page break logic, adjust as needed -->
                <div v-if="(Number(imgIndex) + 1) % 3 === 0" :style="{ pageBreakBefore: 'always' }"></div>
              </div>
            </div>
          </div>
          <div v-else-if="section.type === 'paragraph'" v-html="data[section.sourceKey!] || '-'"></div>
          <div v-else-if="section.type === 'custom'">
            <component :is="section.component" :data="data" />
          </div>
          <div v-else-if="section.type === 'qr'">
            <div class="flex flex-row flex-wrap items-center justify-between gap-4" :style="{ marginTop: '2cm' }">
              <div v-for="activity in data?.child_data_activity_logs" class="flex flex-col gap-2" :style="{ breakInside: 'avoid' }">
                <div>
                  <p class="whitespace-pre-line text-sm">{{ parse('date', activity.created_at) }}</p>
                  <p class="whitespace-pre-line text-sm">{{ activity.name }}</p>
                </div>
                <QRCodeVue
                  :image-settings="{
                    src: HKLogoSVG,
                    height: 12,
                    width: 27,
                    excavate: true,
                  }"
                  :value="`${activity.name} ${activity.rel_user_id_fullname} - ${activity.created_at}`"
                />
                <p class="whitespace-pre-line text-sm">{{ activity.rel_user_id_fullname }}</p>
              </div>
              <!-- <div v-for="qrItem in section.props?.qrItems" class="flex flex-col gap-2" :style="{breakInside: 'avoid'}">
                <p class="text-sm whitespace-pre-line">{{ qrItem.descriptionAboveValue?.(data) }}</p>
                <QRCodeVue
                  :value="qrItem.QRValue?.(data)"
                />
                <p class="text-sm whitespace-pre-line">{{ qrItem.descriptionBelowValue?.(data) }}</p>
              </div> -->
            </div>
          </div>
          <div v-else-if="section.type === 'verification'" class="flex flex-row items-center justify-between">
            <template v-for="actor in section.props?.actor">
              <div v-if="actor === 'reporter'" class="flex flex-col gap-2" :style="{ breakInside: 'avoid' }">
                <div>
                  <p class="whitespace-pre-line text-xs">{{ parse('date', data.created_at) }}</p>
                  <p class="whitespace-pre-line text-sm">Dilaporkan oleh</p>
                </div>
                <QRCodeVue :size="96" :value="`${_window.location.origin}/#/public/certificate?type=creator&id=${data.id}&model_name=${model}&module=${routeName}`" />
                <p class="whitespace-pre-line text-sm">{{ data.rel_created_by }}</p>
              </div>
              <div v-if="actor === 'verificator'" class="flex flex-col gap-2" :style="{ breakInside: 'avoid' }">
                <div>
                  <p class="whitespace-pre-line text-xs">{{ parse('date', data.verified_at) }}</p>
                  <p class="whitespace-pre-line text-sm">Diverifikasi oleh</p>
                </div>
                <QRCodeVue :size="96" :value="`${_window.location.origin}/#/public/certificate?type=verificator&id=${data.id}&model_name=${model}&module=${routeName}`" />
                <p class="whitespace-pre-line text-sm">{{ data.rel_verified_by }}</p>
              </div>
              <div v-if="actor === 'follow-up'" class="flex flex-col gap-2" :style="{ breakInside: 'avoid' }">
                <div>
                  <p class="whitespace-pre-line text-xs">{{ parse('date', data.verified_at) }}</p>
                  <p class="whitespace-pre-line text-sm">Ditindaklanjuti oleh</p>
                </div>
                <QRCodeVue :size="96" :value="`${_window.location.origin}/#/public/certificate?type=verificator&id=${data.id}&model_name=${model}&module=${routeName}`" />
                <p class="whitespace-pre-line text-sm">{{ data.rel_verified_by }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
