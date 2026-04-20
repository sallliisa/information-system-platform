/* @jsxImportSource vue */
import services from '@/utils/services'
import { defineComponent, h, ref } from 'vue'
import ImagePreview from '@/components/base/ImagePreview.vue'
import { parse } from '@/utils/filter'
import Chip from '@/components/base/Chip.vue'
import FileComponent from '@/components/base/FileComponent.vue'
import type { PropType } from 'vue'
import MapView from '@/components/base/MapView.vue'
import Icon from '@/components/base/Icon.vue'
import ImagePreviewMulti from '@/components/base/ImagePreviewMulti.vue'

export async function defaultTableGetData(getAPI: string, searchParameters?: Record<string, number | string | undefined>) {
  const res = await services.list(getAPI, searchParameters)
  return res as { data: Record<string, any>[]; totalPage: number; total: number }
}

export function defaultOnDataLoaded() {
  return
}

export const tableFieldTypes: Record<string, any> = {
  image: defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
      dataKey: {
        default: 'filename',
      },
    },
    setup(props) {
      if (Array.isArray(props.data)) return () => <ImagePreviewMulti images={props.data.map((item: any) => item[props.dataKey])}></ImagePreviewMulti>
      const isString = typeof props.data === 'string'
      const thumbnail = isString ? undefined : props.data?.tumbnail_url || props.data?.thumbnail
      const url = isString ? props.data : props.data?.preview || props.data?.url
      return () => <ImagePreview thumbnail={thumbnail} url={url}></ImagePreview>
    },
  }),
  'image-multi': defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
      dataKey: {
        type: String,
        default: 'filename',
      },
    },
    setup(props) {
      return () => <ImagePreviewMulti images={props.data.map((item: any) => item[props.dataKey])}></ImagePreviewMulti>
    },
  }),
  chip: defineComponent({
    props: {
      data: {
        type: String,
        required: true,
      },
      options: {
        type: Object,
      },
      align: {
        type: String as PropType<'start' | 'center' | 'end'>,
        default: 'start',
      },
    },
    setup({ data, options, align }) {
      const alignClassMap = {
        start: 'flex items-center justify-start',
        center: 'flex items-center justify-center',
        end: 'flex items-center justify-end',
      }
      if (!options)
        return () => (
          <div class={alignClassMap[align]}>
            <Chip>{data}</Chip>
          </div>
        )
      return () =>
        options[data] && (
          <div class={alignClassMap[align]}>
            <Chip color={options[data]?.color} variant={options[data]?.variant}>
              {options[data]?.label}
            </Chip>
          </div>
        )
    },
  }),
  date: defineComponent({
    props: {
      data: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      return () => parse('date', props.data)
    },
  }),
  datetime: defineComponent({
    props: {
      data: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      return () => parse('datetime', props.data)
    },
  }),
  location: defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
      type: {
        type: String as PropType<'map' | 'link'>,
        default: 'link',
      },
    },
    setup({ data, type }) {
      return () =>
        type === 'map' ? (
          <MapView location={{ lat: data.lat, lng: data.lng }} />
        ) : (
          <a href={`https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`} class="flex flex-row items-center gap-2 text-info">
            <Icon name="map-pin"></Icon>
            <span class="underline">Lokasi</span>
          </a>
        )
    },
  }),
  currency: defineComponent({
    props: {
      data: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      return () => parse('currency', props.data)
    },
  }),
  file: defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
    },
    setup(props) {
      if (Array.isArray(props.data))
        return () => (
          <div class="flex flex-row flex-wrap items-center gap-2">
            {props.data.map((item: any) => (
              <FileComponent style="link" filename={item?.filename || item?.data} url={item?.url}></FileComponent>
            ))}
          </div>
        )
      return () => <FileComponent style="link" filename={props.data.filename || props.data.path?.split('/').pop()} url={props.data.url}></FileComponent>
    },
  }),
  'file-multi': defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
    },
    setup(props) {
      return () => (
        <div class="flex flex-row flex-wrap items-center gap-2">
          {props.data.map((item: any) => (
            <FileComponent style="link" filename={item?.filename?.filename} url={item.filename?.url}></FileComponent>
          ))}
        </div>
      )
    },
  }),
  'object-array': defineComponent({
    props: {
      data: {
        type: Array as PropType<Record<string, any>[] | Record<string, any>>,
        required: true,
      },
      view: {
        type: String,
        required: true,
        default: 'name',
      },
      separator: {
        type: String,
        default: ', ',
      },
      compact: {
        type: Boolean,
        default: true,
      },
      maxPreviewItems: {
        type: Number,
        default: 2,
      },
    },
    setup(props) {
      const expanded = ref(false)

      const stringifyValue = (item: any) => {
        if (item == null) return ''
        if (props.view && typeof item === 'object') return String(item[props.view] ?? '')
        if (typeof item === 'object') return JSON.stringify(item)
        return String(item)
      }

      if (Array.isArray(props.data)) {
        if (!props.data.length) return () => '-'
        return () => {
          const labels = props.data.map((item: any) => stringifyValue(item)).filter((item: string) => item !== '')
          if (!labels.length) return '-'

          if (!props.compact) return labels.join(props.separator)

          const maxPreviewItems = Math.max(1, Number(props.maxPreviewItems || 2))
          const isTruncated = labels.length > maxPreviewItems
          const shouldExpand = expanded.value && isTruncated
          if (shouldExpand) {
            return (
              <div class="max-w-full whitespace-normal break-words leading-5">
                <span>{labels.join(props.separator)}</span>
                <button
                  type="button"
                  class="ml-1 text-muted underline"
                  onClick={(event) => {
                    event.stopPropagation()
                    expanded.value = false
                  }}
                >
                  tampilkan lebih sedikit
                </button>
              </div>
            )
          }

          const preview = labels.slice(0, maxPreviewItems).join(props.separator)
          const remaining = Math.max(0, labels.length - maxPreviewItems)

          return (
            <div class="max-w-full whitespace-normal break-words leading-5">
              <span>{preview}</span>
              {remaining > 0 && (
                <button
                  type="button"
                  class="ml-1 text-muted underline"
                  onClick={(event) => {
                    event.stopPropagation()
                    expanded.value = true
                  }}
                >
                  dan {remaining} lainnya
                </button>
              )}
            </div>
          )
        }
      }
      if (!props.data) return () => '-'
      return () => stringifyValue(props.data)
    },
  }),
  html: defineComponent({
    props: {
      data: {
        type: String,
        required: true,
      },
    },
    setup({ data }) {
      return () => h('span', { innerHTML: data })
    },
  }),
}
