// Attendance Module Public API

export { AttendanceService } from './services/attendanceService'
export { AttendanceRepository } from './repositories/attendanceRepository'
export type {
  AttendanceDTO,
  AttendanceSessionDTO,
  CreateAttendanceSessionInput,
  RegisterAttendanceInput,
  EditAttendanceInput,
  ConsecutiveAbsenceCheckResult,
} from './types'
export { registerAttendanceSchema } from './schemas/registerAttendanceSchema'
export { editAttendanceSchema } from './schemas/editAttendanceSchema'
export { createSessionSchema } from './schemas/createSessionSchema'
