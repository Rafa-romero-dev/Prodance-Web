// Attendance calculations

export interface AttendanceRecord {
  status: 'PRESENT' | 'ABSENT'
  date: Date
}

export function getConsecutiveAbsenceCount(attendances: AttendanceRecord[]): number {
  if (attendances.length === 0) {
    return 0
  }

  // Sort by date descending (most recent first)
  const sorted = [...attendances].sort((a, b) => b.date.getTime() - a.date.getTime())

  let count = 0
  for (const attendance of sorted) {
    if (attendance.status === 'ABSENT') {
      count++
    } else {
      break
    }
  }

  return count
}

export function hasConsecutiveAbsences(attendances: AttendanceRecord[]): boolean {
  return getConsecutiveAbsenceCount(attendances) >= 2
}

export function resetConsecutiveAbsences(): number {
  return 0
}

export function isLateArrival(minutesLate?: number): boolean {
  return minutesLate !== undefined && minutesLate > 0
}

export interface SessionDateInfo {
  weekday: string
  date: Date
}

export function getSessionDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getWeekdayFromDate(date: Date): string {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return weekdays[date.getDay()]
}

export function formatAttendanceStatus(status: 'PRESENT' | 'ABSENT'): string {
  return status === 'PRESENT' ? 'Present' : 'Absent'
}

export function isValidSessionDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime()) && date > new Date()
}
