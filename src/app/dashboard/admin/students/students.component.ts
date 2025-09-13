import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Student } from '../../../models/student.models';
import { StudentService } from '../../../services/student.service';
import { StudentFormComponent } from './student-form/student-form.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterModule, StudentFormComponent],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  showAddForm = false;
  editingStudent: Student | null = null;

  // Map to store admin names by student ID
  private adminNames: Map<number, string> = new Map<number, string>();

  userRole: string = '';

  constructor(
    private studentService: StudentService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStudents();
    this.getUserRole();
  }
  
  getUserRole(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userRole = user.role;
    }
  }
  
  viewStudentDetails(studentId: number): void {
    // Navigate to the correct route based on user role
    const basePath = this.userRole === 'SUPERADMIN' ? '/auth/superadmin/students' : '/auth/admin/students';
    this.router.navigate([basePath, studentId, 'details']);
  }

  loadStudents(): void {
    this.isLoading = true;
    this.error = null;
    
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Öğrenciler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading students:', err);
      }
    });
  }

  openAddForm(): void {
    this.editingStudent = null;
    this.showAddForm = true;
  }

  editStudent(student: Student): void {
    console.log('Editing student:', student);
    
    // Get the full student details before opening the form
    this.studentService.getStudentById(student.id).subscribe({
      next: (fullStudentData) => {
        console.log('Full student data loaded:', fullStudentData);
        this.editingStudent = fullStudentData;
        this.showAddForm = true;
      },
      error: (err) => {
        console.error('Error loading full student data:', err);
        this.error = 'Öğrenci bilgileri yüklenirken bir hata oluştu.';
        // Fallback to using the basic student data
        this.editingStudent = student;
        this.showAddForm = true;
      }
    });
  }

  deleteStudent(id: number): void {
    if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = '';
      
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.successMessage = 'Öğrenci başarıyla silindi.';
          this.loadStudents();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Öğrenci silinirken bir hata oluştu.';
          this.isLoading = false;
          console.error('Error deleting student:', err);
        }
      });
    }
  }

  onStudentSaved(student: Student): void {
    this.showAddForm = false;
    this.successMessage = this.editingStudent ? 'Öğrenci başarıyla güncellendi.' : 'Yeni öğrenci başarıyla eklendi.';
    this.loadStudents();
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingStudent = null;
  }
  
  // Get admin name for a student
  getAdminName(studentId: number): string | null {
    // Check if we already have the admin name cached
    if (this.adminNames.has(studentId)) {
      return this.adminNames.get(studentId) || null;
    }
    
    // If not cached, fetch it from the API
    this.studentService.getStudentAdminId(studentId).subscribe({
      next: (adminData) => {
        if (adminData) {
          // Use the admin details directly from the response
          const adminName = adminData.firstName || adminData.username;
          this.adminNames.set(studentId, adminName);
          // Force change detection
          setTimeout(() => {}, 0);
        }
      },
      error: (err) => {
        console.error('Error fetching student admin details:', err);
      }
    });
    
    return null;
  }
}
