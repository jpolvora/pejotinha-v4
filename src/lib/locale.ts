const LOCALE = 'pt-BR'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
})

/** Format value as BRL currency → "R$ 1.234,56" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

/** Format date as DD/MM/AAAA → "24/03/2026" */
export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date))
}

/** Format date with time → "24/03/2026 08:23" */
export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date))
}

/** Format as short date → "24 mar." */
export function formatShortDate(date: Date | string): string {
  return shortDateFormatter.format(new Date(date))
}

/** Format minutes as readable duration → "2h 30min" */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/** Format minutes as compact hours → "2,5h" */
export function formatHoursDecimal(minutes: number): string {
  const hours = minutes / 60
  return `${hours.toLocaleString(LOCALE, { maximumFractionDigits: 1 })}h`
}
