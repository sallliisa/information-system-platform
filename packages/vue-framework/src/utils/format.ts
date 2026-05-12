export function formatCurrency(num: number | undefined | null, locale = 'ID', currency = 'IDR') {
  return num != null ? new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num) : '-'
}

export function formatDate(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', ...(options || {}) }) : '-'
}

export function formatTime(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', ...(options || {}) }) : '-'
}

export function formatDateTime(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date
    ? new Date(date).toLocaleString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', ...(options || {}) })
    : '-'
}

export function formatMonth(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', ...(options || {}) }) : '-'
}

export function formatNumber(num: number | undefined | null, locale = 'id-ID') {
  return num != null ? new Intl.NumberFormat(locale, { style: 'decimal', maximumFractionDigits: 2 }).format(num) : '-'
}
