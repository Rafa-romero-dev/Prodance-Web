export * from './pricing'
export * from './attendance'

// Date utilities
export function getTodayStartOfDay(timezone?: string): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function getTodayEndOfDay(timezone?: string): Date {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return today
}

export function getFirstDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getLastDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function getMonthYearString(date: Date): string {
  return date.toISOString().slice(0, 7) // YYYY-MM
}

export function getCurrentMonthYearString(): string {
  return getMonthYearString(new Date())
}

export function parseMonthYearString(monthYear: string): Date {
  const [year, month] = monthYear.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

export function isCurrentMonth(monthYear: string): boolean {
  return monthYear === getCurrentMonthYearString()
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]/g, '-')
    .replace(/-+/g, '-')
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + '...' : text
}
