import { defineAsyncComponent } from 'vue'

export const componentTypeMap: Record<string, { component?: any; propKeyValue?: [string, string | null][] }> = {
  chip: { component: defineAsyncComponent(() => import('@/components/base/Chip.vue')) },
  image: {
    component: defineAsyncComponent(() => import('@/components/base/ImagePreview.vue')),
    propKeyValue: [
      ['thumbnail', 'tumbnail_url'],
      ['url', 'url'],
    ],
  },
  location: {
    component: defineAsyncComponent(() => import('@/components/base/MapView.vue')),
    propKeyValue: [
      ['lat', 'latitude'],
      ['lng', 'longitude'],
    ],
  },
  file: {
    component: defineAsyncComponent(() => import('@/components/base/FileComponent.vue')),
    propKeyValue: [
      ['url', 'url'],
      ['filename', 'filename'],
    ],
  },
  lookup: {
    propKeyValue: [['preview', null]],
  },
}

export const parsedTypes = ['date', 'datetime', 'currency', 'number', 'unit', 'default']
