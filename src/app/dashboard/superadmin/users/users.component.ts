import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User, UserService } from '../../../services/user.service';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UserFormComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  showAddForm = false;
  editingUser: User | null = null;
  
  constructor(private userService: UserService) {}
  
  // Format date for display
  formatDate(dateValue: string | Date | any[]): string {
    if (!dateValue) return '-';
    
    // If it's an array of date components [year, month, day, hour, minute, second, nano]
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour, minute] = dateValue;
      return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return `${dateValue.getDate().toString().padStart(2, '0')}.${(dateValue.getMonth() + 1).toString().padStart(2, '0')}.${dateValue.getFullYear()} ${dateValue.getHours().toString().padStart(2, '0')}:${dateValue.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // If it's a string, try to parse it
    try {
      const date = new Date(dateValue as string);
      if (!isNaN(date.getTime())) {
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    
    // Return the original value if all else fails
    return String(dateValue);
  }
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.users = []; // Clear existing users
    
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        console.log('Users loaded:', data);
        if (data && Array.isArray(data)) {
          // Just use the data directly without modifying it
          this.users = [...data]; // Create a new array to trigger change detection
          console.log('Users array after assignment:', this.users);
        } else {
          console.error('Unexpected data format:', data);
          this.error = 'Kullanıcı verisi beklenmeyen formatta.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Kullanıcılar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading users:', err);
      }
    });
  }
  
  openAddForm(): void {
    this.showAddForm = true;
    this.editingUser = null;
  }
  
  closeForm(): void {
    this.showAddForm = false;
    this.editingUser = null;
  }
  
  editUser(user: User): void {
    // Get fresh data for the user to ensure we have the latest information
    this.userService.getUserById(user.id).subscribe({
      next: (freshUserData) => {
        console.log('Fresh user data loaded:', freshUserData);
        this.editingUser = freshUserData;
        this.showAddForm = true;
      },
      error: (err) => {
        this.error = 'Kullanıcı bilgileri yüklenirken bir hata oluştu.';
        console.error('Error loading user details:', err);
      }
    });
  }
  
  deleteUser(id: number): void {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = '';
      
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
          this.successMessage = 'Kullanıcı başarıyla silindi.';
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Kullanıcı silinirken bir hata oluştu.';
          this.isLoading = false;
          console.error('Error deleting user:', err);
        }
      });
    }
  }
  
  onUserSaved(user: User): void {
    if (this.editingUser) {
      // Update existing user in the list
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index] = user;
      }
      this.successMessage = 'Kullanıcı başarıyla güncellendi.';
    } else {
      // Add new user to the list
      this.users.push(user);
      this.successMessage = 'Yeni kullanıcı başarıyla eklendi.';
    }
    
    this.closeForm();
  }
}
