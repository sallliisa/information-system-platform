export function formatValue(type: string | undefined, value: any): string {
  if (value === null || value === undefined) return '-'
  if (!type) return String(value)

  if (type === 'date') {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return String(value)
    return parsed.toLocaleDateString()
  }

  if (type === 'datetime') {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return String(value)
    return parsed.toLocaleString()
  }

  if (type === 'currency') {
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return String(value)
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(numeric)
  }

  return String(value)
}
