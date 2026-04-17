/* @jsxImportSource vue */
import ImagePreview from '@/components/base/ImagePreview.vue'
import { parse } from '@/utils/filter'
import services from '@/utils/services'
import { defineAsyncComponent, defineComponent, type PropType } from 'vue'
import { h } from 'vue'
import Chip from '@/components/base/Chip.vue'
import FileComponent from '@/components/base/FileComponent.vue'
import MapView from '@/components/base/MapView.vue'
import Icon from '@/components/base/Icon.vue'
import Table from '@/components/composites/Table.vue'
import ImagePreviewMulti from '@/components/base/ImagePreviewMulti.vue'
import config from '@/config'
import mode from '@/mode'
import { groupBy } from '@/utils/common'

export async function defaultDetailGetData(getAPI: string, searchParameters?: Record<string, any>, getDataID?: string) {
  const { data } = await services.detail(getAPI, getDataID, searchParameters)
  return data
}

export function defaultOnDataLoaded(data: object) {
  return
}

export const detailFieldTypes: Record<string, any> = {
  image: defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
    },
    setup(props) {
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
  file: defineComponent({
    props: {
      data: {
        type: Object,
        required: true,
      },
    },
    setup(props) {
      if (Array.isArray(props.data)) {
        if (props.data?.length === 0) return () => <p>-</p>
        return () => (
          <div class="flex flex-row flex-wrap items-center gap-2">
            {props.data.map((item: any) => (
              <FileComponent filename={item.filename || item.path?.split('/').pop()} url={item.url}></FileComponent>
            ))}
          </div>
        )
      }
      if (!props.data) return () => <p>-</p>
      return () => <FileComponent filename={props.data.filename || props.data.path?.split('/').pop()} url={props.data.url}></FileComponent>
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
          {props.data.map((item: any) => {
            if (props.data.path) return () => <FileComponent style="link" filename={props.data.path.pop?.()} url={`${config.server[mode]}read-file/${props.data.path}`}></FileComponent>
            return <FileComponent style="link" filename={item?.filename?.filename} url={item.filename?.url}></FileComponent>
          })}
        </div>
      )
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
    },
    setup({ data, options }) {
      if (!options) return () => <Chip>{data}</Chip>
      return () => options[data] && <Chip color={options[data]?.color}>{options[data]?.label}</Chip>
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
  'object-array': defineComponent({
    props: {
      data: {
        type: Array as PropType<Record<string, any>[]>,
        required: true,
      },
      view: {
        type: String,
        required: true,
      },
      separator: {
        type: String,
        default: ', ',
      },
    },
    setup(props) {
      if (!props.data?.length) return () => <p>-</p>
      return () => props.data.map((item) => (props.view ? item[props.view] : item)).join(props.separator)
    },
  }),
  'array-clauses': defineComponent({
    props: {
      data: {
        type: Array as PropType<Record<string, any>[]>,
        required: true,
      },
    },
    setup(props) {
      if (!props.data?.length) return () => <p>-</p>

      return () => {
        const shouldGroup = props.data.some((item) => item?.root_title)

        if (!shouldGroup) {
          return (
            <ol class="list-decimal pl-5">
              {props.data.map((clause, index) => (
                <li key={clause.id ?? `${clause.code}-${index}`}>{clause.code}. {clause.title}</li>
              ))}
            </ol>
          )
        }

        const groupedClauses = Object.entries(groupBy(props.data, 'root_title')) as [string, Record<string, any>[]][]

        return (
          <ol class="flex flex-col gap-1.5">
            {groupedClauses.map(([rootTitle, clauses], groupIndex) => (
              <li key={rootTitle || groupIndex}>
                {rootTitle && rootTitle !== 'undefined' ? <p class="font-medium text-muted">{rootTitle}</p> : null}
                {clauses.map((clause, clauseIndex) => (
                  <div key={clause.id ?? `${clause.code}-${clauseIndex}`}>
                    <p>{clause.code}. {clause.title}</p>
                  </div>
                ))}
              </li>
            ))}
          </ol>
        )
      }
    },
  }),
  table: defineComponent({
    props: {
      data: {
        type: Array as PropType<Record<string, any>[]>,
        required: true,
      },
      fields: {
        type: Array as PropType<string[]>,
        required: true,
      },
      fieldsAlias: {
        type: Object,
      },
      fieldsParse: {
        type: Object,
      },
      fieldsType: {
        type: Object,
      },
    },
    setup(props) {
      return () => <Table data={props.data} fields={props.fields} fieldsAlias={props.fieldsAlias} fieldsParse={props.fieldsParse} fieldsType={props.fieldsType} />
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
