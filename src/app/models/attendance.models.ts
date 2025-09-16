export interface Attendance {
  id?: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  courseLocationId: number;
  courseLocationName: string;
  attendanceDate: string;
  isPresent: boolean;
  notes?: string;
  createdById?: number;
  createdByName?: string;
}

export interface AttendanceRequest {
  courseId: number;
  courseLocationId: number;
  attendanceDate: string;
  studentRecords: StudentAttendanceRecord[];
  notes?: string;
}

export interface StudentAttendanceRecord {
  studentId: number;
  isPresent: boolean;
}

export interface AttendanceStats {
  presentDays: number;
  absentDays: number;
  totalDays: number;
}
