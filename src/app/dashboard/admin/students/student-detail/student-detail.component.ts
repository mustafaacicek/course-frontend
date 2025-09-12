import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../services/student.service';
import { StudentDetail } from '../../../../models/student-detail.model';
import { Student } from '../../../../models/student.models';
import { LessonNote } from '../../../../models/lesson-note.model';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
})
export class StudentDetailComponent implements OnInit {
  studentId: number = 0;
  student: StudentDetail | null = null;
  isLoading = true;
  error: string | null = null;
  activeTab = 'overview'; // 'overview', 'courses', 'notes', 'locations'
  
  // For note history modal
  showHistoryModal = false;
  selectedNote: LessonNote | null = null;
  
  // For teacher comment
  teacherComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.studentId = +id;
        this.loadStudentDetails();
      }
    });
  }

  loadStudentDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.studentService.getStudentDetails(this.studentId).subscribe({
      next: (data) => {
        // Convert date arrays to Date objects
        this.student = this.convertDates(data);
        console.log('Student details with converted dates:', this.student);
        this.teacherComment = this.student?.teacherComment || '';
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Öğrenci bilgileri yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading student details:', err);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getPassRatePercentage(): number {
    if (!this.student || this.student.totalLessons === 0) {
      return 0;
    }
    return Math.round((this.student.passedLessons / this.student.totalLessons) * 100);
  }

  getFailRatePercentage(): number {
    if (!this.student || this.student.totalLessons === 0) {
      return 0;
    }
    return Math.round((this.student.failedLessons / this.student.totalLessons) * 100);
  }

  getUndeterminedRatePercentage(): number {
    if (!this.student || this.student.totalLessons === 0) {
      return 0;
    }
    const undetermined = this.student.totalLessons - this.student.passedLessons - this.student.failedLessons;
    return Math.round((undetermined / this.student.totalLessons) * 100);
  }
  
  showNoteHistory(note: LessonNote): void {
    this.selectedNote = note;
    this.showHistoryModal = true;
  }
  
  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedNote = null;
  }
  
  getPassStatusText(passed: boolean | null | undefined): string {
    if (passed === null || passed === undefined) return 'Belirlenmedi';
    return passed ? 'Geçti' : 'Kaldı';
  }
  
  getPassStatusClass(passed: boolean | null | undefined): string {
    if (passed === null || passed === undefined) return 'status-unknown';
    return passed ? 'status-passed' : 'status-failed';
  }
  
  saveTeacherComment(): void {
    if (!this.student) return;
    
    this.isLoading = true;
    this.studentService.updateTeacherComment(this.studentId, this.teacherComment).subscribe({
      next: (data) => {
        this.student = this.convertDates(data);
        this.isLoading = false;
        // Show success message or notification here if needed
      },
      error: (err) => {
        this.error = 'Öğretmen yorumu kaydedilirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error saving teacher comment:', err);
      }
    });
  }
  
  /**
   * Recursively converts date arrays to Date objects
   * @param obj The object to convert dates in
   * @returns The object with converted dates
   */
  convertDates(obj: any): any {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      // If it's a date array (length 3 or 7 with numbers)
      if ((obj.length === 3 || obj.length === 7) && obj.every(item => typeof item === 'number')) {
        // It's likely a date array [year, month, day] or [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour = 0, minute = 0, second = 0] = obj;
        return new Date(year, month - 1, day, hour, minute, second);
      }
      
      // If it's a regular array, convert each item
      return obj.map(item => this.convertDates(item));
    }
    
    if (typeof obj === 'object') {
      const result = {...obj};
      
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          result[key] = this.convertDates(result[key]);
        }
      }
      
      return result;
    }
    
    return obj;
  }
}
