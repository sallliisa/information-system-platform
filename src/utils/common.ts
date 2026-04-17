import offlineCSS from '@/assets/offline.css?inline'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const titleCase = (s: string) => s.replace(/^[-_]*(.)/, (_: any, c: any) => c.toUpperCase()).replace(/[-_]+(.)/g, (_: any, c: any) => ' ' + c.toUpperCase())

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function formatCurrency(num: number | undefined | null, locale = 'ID', currency = 'IDR') {
  return num != null ? new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num) : '-'
}

export function formatDate(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', ...(options ? options : {}) }) : '-'
}

export function formatTime(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', ...(options ? options : {}) }) : '-'
}

export function formatDateTime(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', ...(options ? options : {}) }) : '-'
}

export function formatMonth(date: string | undefined | null, options?: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  return date ? new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', ...(options ? options : {}) }) : '-'
}

export function formatNumber(num: number | undefined | null, locale = 'id-ID') {
  return num != null ? new Intl.NumberFormat(locale, { style: 'decimal', maximumFractionDigits: 2 }).format(num) : '-'
}

export function formatDelta(value: number) {
  const num = Number(value || 0)
  if (num > 0) return `+${num.toFixed(2)}%`
  return `${num.toFixed(2)}%`
}

export function formatHour(label: string) {
  const parts = String(label || '').split(' ')
  return parts.length > 1 ? parts[1] : parts[0] || '-'
}

export function formatLargeNumber(num: number | undefined | null, locale = 'id-ID') {
  if (num == null) return '-'

  const absNum = Math.abs(num)

  if (absNum >= 1e9) {
    return (
      new Intl.NumberFormat(locale, {
        style: 'decimal',
        maximumFractionDigits: 1,
      }).format(num / 1e9) + 'mil'
    ) // Billions
  } else if (absNum >= 1e6) {
    return (
      new Intl.NumberFormat(locale, {
        style: 'decimal',
        maximumFractionDigits: 1,
      }).format(num / 1e6) + 'jt'
    ) // Millions
  } else if (absNum >= 1e3) {
    return (
      new Intl.NumberFormat(locale, {
        style: 'decimal',
        maximumFractionDigits: 1,
      }).format(num / 1e3) + 'rb'
    ) // Thousands
  } else {
    return new Intl.NumberFormat(locale, { style: 'decimal' }).format(num) // Regular formatting
  }
}

export const monthDiff = (dateFrom: Date, dateTo: Date) => {
  return dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear())
}

export function redirect(url: string) {
  if (url.slice(0, 8) !== 'https://' || url.slice(0, 7) !== 'http://') url = `https://${url}`
  window.open(url, '_blank')
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const printHTML = (elementID: string) => {
  const innerHTML = document.getElementById(elementID)!.innerHTML.replace(/"/g, `'`)
  const printedHTML = `
  <html>
		<head>
			<meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@100;200;300;400;500;600;700;800;900;1000&display=swap" rel="stylesheet" />
      <style>
        ${offlineCSS}
      </style>
		</head>
		<body style="-webkit-print-color-adjust: exact !important;">
      ${innerHTML}
    </body>
	</html>
  `
  const frame = document.createElement('iframe')
  frame.setAttribute('id', 'printing-frame')
  frame.setAttribute('name', 'printing-frame')
  frame.setAttribute('src', 'about:blank')
  frame.setAttribute('frameborder', '0')
  frame.setAttribute('scrolling', 'no')
  frame.setAttribute('style', 'position: absolute; top: -100em; left: -100em;')
  document.body.appendChild(frame)
  const frameDoc = frame.contentWindow?.document
  frameDoc!.open()
  frameDoc!.write(printedHTML)
  frameDoc!.close()
  frame.focus()
  setTimeout(() => {
    frame.contentWindow?.print()
    document.body.removeChild(frame)
  }, 500)
}

export const getObjectValue = (o: object, s: string): any => {
  s = s.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
  s = s.replace(/^\./, '') // strip a leading dot
  const a = s.split('.')
  for (let i = 0, n = a.length; i < n; ++i) {
    const k: any = a[i]
    if (k in o) {
      o = (o as any)[k]
    } else {
      return
    }
  }
  return o
}

export function openInMaps(lat: any, lng: any) {
  window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
}

export function groupBy(xs: any[], key: string) {
  return xs.reduce(function (rv, x) {
    ;(rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value)
}

export function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

export function sumArray(numbers: any[]): number {
  return numbers.reduce((sum, num) => sum + num, 0)
}

export const moduleNameTitleMap: any = {
  'highway-patrol': 'Patroli',
  'handover-form': 'Serah Terima',
  'handover-transaction-service': 'Serah Terima Layanan Transaksi',
  'general-form': 'Form General',
  general_transactions: 'Kegiatan Rutin',
  'inspection-form': 'Inspeksi',
  patrol: 'Patroli',
  shift_changes: 'Tukar Shift',
  overtimes: 'Pengajuan Lembur',
  annual_leaves: 'Pengajuan Cuti',
  'rollpaper-usage': 'Pemakaian Rollpaper',
  'queue-transaction-monitoring': 'Antrian & Lama Transaksi',
  'toll-volume-revenue': 'Volume Kendaraan',
  'emergency-form': 'Insiden',
  accident_reports: 'Insiden',
  accident_towings: 'Izin Penderekan',
  'spm-manual': 'Self-assessment SPM',
  hse_permits: 'Permit',
  hse_transactions: 'Permanent HSSE Activity',
  routine_maintenance: 'Pemeliharaan Rutin',
  minor_asset_damages: 'Temuan',
  inspection_items: 'Temuan',
  permit_tickets: 'Temuan',
}

export const moduleNameRouteMap: any = {
  'highway-patrol': 'highway-patrols',
  'handover-form': 'handover-transactions',
  'handover-transaction-service': 'lattol-handovers',
  'general-form': 'general-transactions',
  general_transactions: 'general-transactions',
  'inspection-form': 'inspections',
  patrol: 'highway-patrols',
  shift_changes: 'shift-changes',
  overtimes: 'overtimes',
  annual_leaves: 'annual-leaves',
  'rollpaper-usage': 'rollpaper-usages',
  'queue-transaction-monitoring': 'monitoring-transactions',
  'toll-volume-revenue': 'toll-volume-revenue',
  'emergency-form': 'incidents',
  accident_reports: 'incidents',
  accident_towings: 'incidents',
  'spm-manual': 'spm-sla-manual',
  hse_permits: 'hse-permits',
  hse_transactions: 'hse-transactions',
  routine_maintenance: 'routine-maintenances',
  minor_asset_damages: 'inspection-damages',
  inspection_items: 'inspection-damages',
  permit_tickets: 'inspection-damages',
}

export const formGroupCodeMap: any = {
  accident_reports: 'accident',
  accident_towings: 'accident-towings',
  incident_actions: 'actions',
}

export function parseCode(text: string) {
  if (!text) return ''
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .normalize('NFD') // Normalize to decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9_\s]/g, '') // Remove non-alphanumeric characters (except spaces and underscores)
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with a single underscore
}

export function indexCompare(mode: 'moreThan' | 'lessThan' | 'moreThanOrEqual' | 'lessThanOrEqual', arr: any[], value: any, isMoreThan: any) {
  switch (mode) {
    case 'moreThan':
      return arr.findIndex((item: any) => item === value) > arr.findIndex((item: any) => item === isMoreThan)
    case 'lessThan':
      return arr.findIndex((item: any) => item === value) < arr.findIndex((item: any) => item === isMoreThan)
    case 'moreThanOrEqual':
      return arr.findIndex((item: any) => item === value) >= arr.findIndex((item: any) => item === isMoreThan)
    case 'lessThanOrEqual':
      return arr.findIndex((item: any) => item === value) <= arr.findIndex((item: any) => item === isMoreThan)
  }
}

// File preview utilities
export const PREVIEWABLE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'webm', 'ogg']

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function isPreviewableExtension(extension: string): boolean {
  return PREVIEWABLE_EXTENSIONS.includes(extension)
}

// MIME type to display name mapping
export const MIME_TYPE_NAMES: Record<string, string> = {
  // Images
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/gif': 'GIF Image',
  'image/webp': 'WebP Image',
  'image/svg+xml': 'SVG Image',

  // Videos
  'video/mp4': 'MP4 Video',
  'video/webm': 'WebM Video',
  'video/x-msvideo': 'AVI Video',
  'video/quicktime': 'MOV Video',

  // Documents
  'application/pdf': 'PDF Document',
  'application/msword': 'Word Document (.doc)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (.docx)',
  'application/vnd.ms-excel': 'Excel Spreadsheet (.xls)',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet (.xlsx)',
  'application/vnd.ms-powerpoint': 'PowerPoint (.ppt)',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint (.pptx)',
  'text/plain': 'Text File',

  // Audio
  'audio/mpeg': 'MP3 Audio',
  'audio/wav': 'WAV Audio',
  'audio/ogg': 'OGG Audio',
  'audio/aac': 'AAC Audio',
}
