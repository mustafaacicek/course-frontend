import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../services/attendance.service';
import { StudentService } from '../../../services/student.service';
import { CourseService } from '../../../services/course.service';
import { CourseLocationService } from '../../../services/course-location.service';
import { Attendance, AttendanceRequest, StudentAttendanceRecord } from '../../../models/attendance.models';
import { Student } from '../../../models/student.models';
import { Course } from '../../../models/course.models';
import { CourseLocation } from '../../../models/course-location.models';
import { AuthService } from '../../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  // Data
  students: Student[] = [];
  courses: Course[] = [];
  locations: CourseLocation[] = [];
  attendances: Attendance[] = [];
  availableDates: string[] = [];
  
  // Selected values
  selectedCourse: number | null = null;
  selectedLocation: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  notes: string = '';
  
  // UI state
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  showForm = false;
  viewMode: 'form' | 'calendar' = 'form';
  
  // Calendar related properties
  currentMonth: Date = new Date();
  calendarDays: Array<{
    date: string;
    dayNumber: number;
    otherMonth: boolean;
    hasAttendance: boolean;
    isToday: boolean;
  }> = [];
  attendanceSummary: {
    presentCount: number;
    absentCount: number;
    totalCount: number;
  } | null = null;
  
  // Student attendance records for the form
  studentRecords: { student: Student; isPresent: boolean }[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private courseService: CourseService,
    private locationService: CourseLocationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }
  
  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;
    
    // Get user's course locations
    this.locationService.getLocationsForCurrentAdmin().pipe(
      catchError((err: any) => {
        this.error = 'Lokasyonlar yüklenirken bir hata oluştu.';
        console.error('Error loading locations:', err);
        return of([]);
      })
    ).subscribe({
      next: (locations: CourseLocation[]) => {
        this.locations = locations;
        this.isLoading = false;
        
        // Get available attendance dates
        this.attendanceService.getAttendanceDatesByUserLocations().subscribe({
          next: (dates: string[]) => {
            this.availableDates = dates;
          },
          error: (err: any) => {
            this.error = 'Yoklama tarihleri yüklenirken bir hata oluştu.';
            console.error('Error loading attendance dates:', err);
          }
        });
      },
      error: (err: any) => {
        this.error = 'Veriler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error in loadInitialData:', err);
      }
    });
  }
  
  onLocationChange(): void {
    if (!this.selectedLocation) return;
    
    this.isLoading = true;
    this.error = null;
    
    // Get courses for the selected location
    this.courseService.getCoursesByLocationId(this.selectedLocation).subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        this.selectedCourse = courses.length > 0 ? courses[0].id : null;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Kurslar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading courses by location:', err);
      }
    });
  }
  
  loadStudentsForAttendance(): void {
    if (!this.selectedLocation) {
      this.error = 'Lütfen bir lokasyon seçin.';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    this.showForm = false;
    
    // Get students for the selected location
    this.studentService.getStudentsByLocationId(this.selectedLocation as number).pipe(
      catchError((err: any) => {
        this.error = 'Öğrenciler yüklenirken bir hata oluştu.';
        console.error('Error loading students:', err);
        return of([]);
      }),
      switchMap((students: Student[]) => {
        this.students = students;
        
        // Initialize student records for the form
        this.studentRecords = students.map((student: Student) => ({
          student,
          isPresent: true // Default to present
        }));
        
        // Check if attendance records already exist for this date and location
        if (this.selectedDate && this.selectedLocation) {
          return this.attendanceService.getAttendanceByLocationAndDate(this.selectedLocation, this.selectedDate);
        }
        return of([]);
      }),
      catchError((err: any) => {
        this.error = 'Yoklama kayıtları yüklenirken bir hata oluştu.';
        console.error('Error loading attendance records:', err);
        return of([]);
      })
    ).subscribe({
      next: (attendances: Attendance[]) => {
        // If attendance records exist, update the student records
        if (attendances.length > 0) {
          this.attendances = attendances;
          
          // Update student records with existing attendance data
          attendances.forEach((attendance: Attendance) => {
            const recordIndex = this.studentRecords.findIndex(r => r.student.id === attendance.studentId);
            if (recordIndex !== -1) {
              this.studentRecords[recordIndex].isPresent = attendance.isPresent;
            }
          });
          
          // Get notes from the first record (they should all have the same notes)
          if (attendances[0]?.notes) {
            this.notes = attendances[0].notes;
          }
        }
        
        this.isLoading = false;
        this.showForm = true;
      },
      error: (err: any) => {
        this.error = 'Veriler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error in loadStudentsForAttendance:', err);
      }
    });
  }
  
  saveAttendance(): void {
    if (!this.selectedCourse || !this.selectedLocation || !this.selectedDate) {
      this.error = 'Lütfen tüm gerekli alanları doldurun.';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    this.successMessage = '';
    
    // Prepare the request
    const request: AttendanceRequest = {
      courseId: this.selectedCourse,
      courseLocationId: this.selectedLocation,
      attendanceDate: this.selectedDate,
      notes: this.notes,
      studentRecords: this.studentRecords.map(record => ({
        studentId: record.student.id,
        isPresent: record.isPresent
      }))
    };
    
    this.attendanceService.saveAttendanceRecords(request).subscribe({
      next: (response: Attendance[]) => {
        this.successMessage = 'Yoklama başarıyla kaydedildi.';
        this.isLoading = false;
        
        // Update available dates
        this.attendanceService.getAttendanceDatesByUserLocations().subscribe({
          next: (dates: string[]) => {
            this.availableDates = dates;
          }
        });
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Yoklama kaydedilirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error saving attendance:', err);
      }
    });
  }
  
  loadExistingAttendance(): void {
    if (!this.selectedDate || !this.selectedLocation) {
      this.error = 'Lütfen tarih ve lokasyon seçin.';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    // Get attendance records for the selected date and location
    this.attendanceService.getAttendanceByLocationAndDate(this.selectedLocation, this.selectedDate).subscribe({
      next: (attendances: Attendance[]) => {
        if (attendances.length === 0) {
          this.error = 'Seçilen tarih ve lokasyon için yoklama kaydı bulunamadı.';
          this.isLoading = false;
          return;
        }
        
        this.attendances = attendances;
        
        // Set the course from the first attendance record
        if (attendances[0]?.courseId) {
          this.selectedCourse = attendances[0].courseId;
        }
        
        // Load students for this location
        this.studentService.getStudentsByLocationId(this.selectedLocation as number).subscribe({
          next: (students: Student[]) => {
            this.students = students;
            
            // Initialize student records with attendance data
            this.studentRecords = students.map((student: Student) => {
              const attendance = attendances.find(a => a.studentId === student.id);
              return {
                student,
                isPresent: attendance ? attendance.isPresent : false
              };
            });
            
            // Get notes from the first record
            if (attendances[0]?.notes) {
              this.notes = attendances[0].notes;
            }
            
            this.isLoading = false;
            this.showForm = true;
          },
          error: (err: any) => {
            this.error = 'Öğrenciler yüklenirken bir hata oluştu.';
            this.isLoading = false;
            console.error('Error loading students:', err);
          }
        });
      },
      error: (err: any) => {
        this.error = 'Yoklama kayıtları yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading attendance records:', err);
      }
    });
  }
  
  markAllPresent(): void {
    this.studentRecords.forEach(record => {
      record.isPresent = true;
    });
  }
  
  markAllAbsent(): void {
    this.studentRecords.forEach(record => {
      record.isPresent = false;
    });
  }
  
  resetForm(): void {
    this.selectedCourse = null;
    this.selectedLocation = null;
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.notes = '';
    this.studentRecords = [];
    this.showForm = false;
    this.successMessage = '';
    this.error = null;
  }
  
  // Calendar related methods
  loadAttendanceDates(): void {
    if (!this.selectedLocation) {
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    // Get available attendance dates for the selected location
    this.attendanceService.getAttendanceDatesByUserLocations().subscribe({
      next: (dates: string[]) => {
        this.availableDates = dates;
        this.generateCalendar();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Yoklama tarihleri yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading attendance dates:', err);
      }
    });
  }
  
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week of the first day (0 = Sunday, 1 = Monday, ...)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    const todayString = this.formatDateToISOString(today);
    
    this.calendarDays = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const dateString = this.formatDateToISOString(date);
      
      this.calendarDays.push({
        date: dateString,
        dayNumber: day,
        otherMonth: true,
        hasAttendance: this.availableDates.includes(dateString),
        isToday: dateString === todayString
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = this.formatDateToISOString(date);
      
      this.calendarDays.push({
        date: dateString,
        dayNumber: day,
        otherMonth: false,
        hasAttendance: this.availableDates.includes(dateString),
        isToday: dateString === todayString
      });
    }
    
    // Add days from next month
    const totalDays = this.calendarDays.length;
    const daysToAdd = 42 - totalDays; // 6 weeks * 7 days = 42
    
    for (let day = 1; day <= daysToAdd; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = this.formatDateToISOString(date);
      
      this.calendarDays.push({
        date: dateString,
        dayNumber: day,
        otherMonth: true,
        hasAttendance: this.availableDates.includes(dateString),
        isToday: dateString === todayString
      });
    }
  }
  
  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }
  
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }
  
  selectDate(dateString: string): void {
    this.selectedDate = dateString;
    
    if (!this.selectedLocation) {
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    // Get attendance records for the selected date and location
    this.attendanceService.getAttendanceByLocationAndDate(this.selectedLocation, this.selectedDate).subscribe({
      next: (attendances: Attendance[]) => {
        this.attendances = attendances;
        
        // Calculate attendance summary
        const presentCount = attendances.filter(a => a.isPresent).length;
        const absentCount = attendances.filter(a => !a.isPresent).length;
        
        this.attendanceSummary = {
          presentCount,
          absentCount,
          totalCount: presentCount + absentCount
        };
        
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Yoklama kayıtları yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading attendance records:', err);
        this.attendanceSummary = null;
      }
    });
  }
  
  viewAttendanceDetails(): void {
    // Switch to form view and load existing attendance
    this.viewMode = 'form';
    this.loadExistingAttendance();
  }
  
  // Helper method to format date to ISO string without timezone issues
  private formatDateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
