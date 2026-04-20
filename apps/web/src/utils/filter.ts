import { formatCurrency, formatDate, formatDateTime, formatDelta, formatHour, formatLargeNumber, formatMonth, formatNumber, formatTime } from '@/utils/common'
import _dictionary from '@/app/configs/_dictionary'

export const filter: Record<string, Record<string, string>> = _dictionary

const formatterMap: Record<string, any> = {
  number: formatNumber,
  largeNumber: formatLargeNumber,
  currency: formatCurrency,
  month: formatMonth,
  date: formatDate,
  time: formatTime,
  datetime: formatDateTime,
  hour: formatHour,
  delta: formatDelta
}

export const parse = (key: string, value: string | number): any => {
  if (!formatterMap[key]) return filter[key]?.[value] || value
  else return formatterMap[key as keyof typeof formatterMap]?.(value as any) || value
}
