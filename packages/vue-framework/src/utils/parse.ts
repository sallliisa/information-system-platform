import { formatCurrency, formatDate, formatDateTime, formatMonth, formatNumber, formatTime } from './format'

const defaultFormatters: Record<string, (value: any) => any> = {
  number: formatNumber,
  currency: formatCurrency,
  month: formatMonth,
  date: formatDate,
  time: formatTime,
  datetime: formatDateTime
}

export function createParser(options?: {
  dictionary?: Record<string, Record<string, string>>
  formatters?: Record<string, (value: any) => any>
}) {
  const dictionary = options?.dictionary || {}
  const formatters = { ...defaultFormatters, ...(options?.formatters || {}) }

  return (key: string, value: any): any => {
    if (!formatters[key]) return dictionary[key]?.[value] || value
    return formatters[key](value)
  }
}

export const parse = createParser()
